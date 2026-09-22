import { prisma } from '../config/database';
import { enviarEmailNotificacao } from './emailService';

export interface PrevisaoFalha {
  tag: string;
  ativoNome: string;
  risco: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  tendencia: 'ESTAVEL' | 'ELEVACAO' | 'QUEDA';
  valorAtual: number;
  unidade: string;
  limiteAlarme: number | null;
  estimativaMinutosAteFalha: number | null;
  probabilidade: number;
  diagnostico: string;
  acaoRecomendada: string;
}

export async function analisarPrevisaoEEnviarNotificacao(tagAlvo?: string): Promise<PrevisaoFalha[]> {
  const ativosMonitored = [
    { tag: 'CF-01-TMP', nome: 'Câmara 01 (Resfriados)', limite: 7.0, unidade: '°C' },
    { tag: 'CF-02-TMP', nome: 'Câmara 02 (Congelados)', limite: -15.0, unidade: '°C' },
    { tag: 'CMP-01-VIB', nome: 'Compressor 01 (Amônia)', limite: 7.1, unidade: 'mm/s' },
    { tag: 'CMP-02-VIB', nome: 'Compressor 02 (Amônia)', limite: 7.1, unidade: 'mm/s' },
  ];

  const listaFiltrada = tagAlvo
    ? ativosMonitored.filter((a) => a.tag === tagAlvo)
    : ativosMonitored;

  const resultados: PrevisaoFalha[] = [];

  for (const item of listaFiltrada) {
    const config = await prisma.gatewayConfig.findFirst({
      where: { tag: item.tag },
    });

    if (!config) continue;

    const leituras = await prisma.leitura.findMany({
      where: {
        gatewayId: config.gatewayId,
        canal: config.canal,
        valor: { not: null },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    if (leituras.length < 3) continue;

    const valorAtual = leituras[0].valor!;
    const valorAntigo = leituras[leituras.length - 1].valor!;

    const diffMinutos = Math.max(
      1,
      (new Date(leituras[0].timestamp).getTime() - new Date(leituras[leituras.length - 1].timestamp).getTime()) / 60000
    );

    const taxaPorMinuto = (valorAtual - valorAntigo) / diffMinutos;

    let risco: 'NORMAL' | 'ATENCAO' | 'CRITICO' = 'NORMAL';
    let tendencia: 'ESTAVEL' | 'ELEVACAO' | 'QUEDA' = 'ESTAVEL';
    let estimativaMinutos: number | null = null;
    let probabilidade = 0;
    let diagnostico = 'Operação dentro dos parâmetros estáveis.';
    let acaoRecomendada = 'Manter monitoramento padrão.';

    if (taxaPorMinuto > 0.02) tendencia = 'ELEVACAO';
    else if (taxaPorMinuto < -0.02) tendencia = 'QUEDA';

    // Regra Preditiva para Câmaras Frias (Temperatura)
    if (item.tag.includes('CF')) {
      if (valorAtual > 5.0 && taxaPorMinuto > 0.01) {
        const delta = item.limite - valorAtual;
        estimativaMinutos = delta > 0 ? Math.ceil(delta / taxaPorMinuto) : 0;

        if (estimativaMinutos <= 45 || valorAtual >= item.limite) {
          risco = 'CRITICO';
          probabilidade = 92;
          diagnostico = `Elevação contínua de temperatura (+${taxaPorMinuto.toFixed(2)}°C/min). Projeção para atingir limite em ~${estimativaMinutos} min.`;
          acaoRecomendada = 'Verificar vedação da porta, acionar degelo manual ou checar expansão de amônia.';
        } else {
          risco = 'ATENCAO';
          probabilidade = 65;
          diagnostico = `Subida de temperatura detectada. Limite estipulado pode ser atingido em ~${estimativaMinutos} min se mantida a tendência.`;
          acaoRecomendada = 'Inspecionar recirculação interna de ar e portas do setor.';
        }
      }
    }

    // Regra Preditiva para Compressores (Vibração RMS)
    if (item.tag.includes('CMP')) {
      if (valorAtual > 4.5 && taxaPorMinuto > 0.02) {
        const delta = item.limite - valorAtual;
        estimativaMinutos = delta > 0 ? Math.ceil(delta / taxaPorMinuto) : 0;

        if (estimativaMinutos <= 30 || valorAtual >= item.limite) {
          risco = 'CRITICO';
          probabilidade = 88;
          diagnostico = `Aumento progressivo de vibração (+${taxaPorMinuto.toFixed(2)} mm/s/min). Indicação de possível desalinhamento ou desgaste.`;
          acaoRecomendada = 'Realizar inspeção mecânica no acoplamento e nível de lubrificante.';
        } else {
          risco = 'ATENCAO';
          probabilidade = 60;
          diagnostico = `Oscilação de vibração acima do normal. Limite de alarme projetado para ~${estimativaMinutos} min.`;
          acaoRecomendada = 'Programar checagem preventiva nos rolamentos no próximo ciclo.';
        }
      }
    }

    if (risco === 'CRITICO' || risco === 'ATENCAO') {
      enviarEmailNotificacao({
        tipoEvento: 'PREDITIVO',
        tag: item.tag,
        titulo: `Tendência de Falha Preditiva Detectada`,
        detalheOuDiagnostico: diagnostico,
        acaoRecomendada,
        valorAtual: valorAtual.toFixed(1),
        unidade: item.unidade,
        estimativaMinutos,
      });
    }

    resultados.push({
      tag: item.tag,
      ativoNome: item.nome,
      risco,
      tendencia,
      valorAtual,
      unidade: item.unidade,
      limiteAlarme: item.limite,
      estimativaMinutosAteFalha: estimativaMinutos,
      probabilidade,
      diagnostico,
      acaoRecomendada,
    });
  }

  return resultados;
}