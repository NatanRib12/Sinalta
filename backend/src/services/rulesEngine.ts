import { prisma } from '../config/database';
import { transmitirMensagem } from '../http/websocket/wsHandler';
import { enviarEmailNotificacao } from './emailService';
import { analisarPrevisaoEEnviarNotificacao } from './predictiveEngine';

const offsetsEnergia: Record<string, number> = {};

export async function processarAlertas(
  gatewayId: string,
  canal: number,
  valor: number | null,
  timestamp: Date,
  erroSensor?: string | null
) {
  const dataTimestamp = new Date(timestamp);

  const config = await prisma.gatewayConfig.findUnique({
    where: { gatewayId_canal: { gatewayId, canal } },
  });

  if (!config) return;

  // 1. DETECÇÃO DE QUEDA DE SENSOR OU ERRO DE LEITURA (Disparo Instantâneo)
  if (erroSensor || valor === null || isNaN(valor)) {
    enviarEmailNotificacao({
      tipoEvento: 'INSTANTANEO',
      tag: config.tag,
      ativoNome: config.descricao || config.tag,
      titulo: `Falha de Comunicação / Queda do Sensor`,
      detalheOuDiagnostico: `O sensor da ${config.descricao || config.tag} parou de responder ou apresentou erro de leitura (${erroSensor || 'Sem sinal'}).`,
      acaoRecomendada: `Verificar conexão física do cabo no gateway ${gatewayId} e alimentação elétrica do sensor.`,
      valorAtual: 'ERR / INDISPONÍVEL',
    });
    return;
  }

  // --- 2. TRATAMENTO DE ROLLOVER DE KWH (EVITA QUEDA A ZERO) ---
  let valorAjustado = valor;

  if (config.tag.includes('KWH') || config.grandeza === 'energia') {
    const chaveMedidor = `${gatewayId}_${canal}`;
    const offsetAtual = offsetsEnergia[chaveMedidor] || 0;

    const ultimaLeitura = await prisma.leitura.findFirst({
      where: { gatewayId, canal, timestamp: { lt: dataTimestamp } },
      orderBy: { timestamp: 'desc' },
    });

    if (ultimaLeitura && ultimaLeitura.valor !== null) {
      const valorAnteriorSemOffset = ultimaLeitura.valor - offsetAtual;

      // Se o registrador reseta (ex: de >10.000 kWh para <2.000 kWh)
      if (valorAnteriorSemOffset > 10000 && valor < 2000) {
        const novoOffset = offsetAtual + valorAnteriorSemOffset;
        offsetsEnergia[chaveMedidor] = novoOffset;
        console.log(`⚡ [kWh Rollover Detectado] Aplicando offset de +${novoOffset.toFixed(1)} kWh no medidor ${config.tag}`);
      }
    }

    valorAjustado = valor + (offsetsEnergia[chaveMedidor] || 0);
  }

  const valorFinal = valorAjustado;

  // --- 3. ALERTA INSTANTÂNEO DE COMPRESSOR (Vibração RMS Elevada) ---
  if (config.grandeza === 'vibracao_rms' || config.tag.includes('VIB')) {
    const limiteVibracao = config.alarmeAlto ?? 7.1;

    if (valorFinal > limiteVibracao) {
      const alertaAtivo = await prisma.alerta.findFirst({
        where: { gatewayId, canal, tipo: 'VIBRACAO_ELEVADA', ativo: true },
      });

      if (!alertaAtivo) {
        const novoAlerta = await prisma.alerta.create({
          data: {
            gatewayId,
            canal,
            tipo: 'VIBRACAO_ELEVADA',
            mensagem: `Vibração elevada no compressor (${config.tag}): ${valorFinal.toFixed(2)} ${config.unidade || 'mm/s'}`,
            inicio: dataTimestamp,
            ativo: true,
          },
        });

        transmitirMensagem('ALERTA', novoAlerta);

        enviarEmailNotificacao({
          tipoEvento: 'INSTANTANEO',
          tag: config.tag,
          ativoNome: config.descricao || config.tag,
          titulo: `Vibração Crítica Atingida`,
          detalheOuDiagnostico: `Vibração RMS atingiu ${valorFinal.toFixed(2)} mm/s, ultrapassando o limite seguro de ${limiteVibracao} mm/s.`,
          acaoRecomendada: `Inspecionar alinhamento mecânico, coxins de fixação e lubrificação do compressor.`,
          valorAtual: valorFinal.toFixed(2),
          unidade: config.unidade || 'mm/s',
        });
      }
    } else {
      await prisma.alerta.updateMany({
        where: { gatewayId, canal, tipo: 'VIBRACAO_ELEVADA', ativo: true },
        data: { ativo: false, fim: dataTimestamp },
      });
    }
  }

  // --- 4. ALERTA INSTANTÂNEO DE CÂMARAS (Temperatura Elevada > 7°C) ---
  if (config.unidade === 'C' || config.tag.includes('TMP')) {
    if (valorFinal > 50 || valorFinal < -40) return; // Descarte de ruídos

    const LIMITE_TEMP = 7.0;

    if (valorFinal > LIMITE_TEMP) {
      const alertaAtivo = await prisma.alerta.findFirst({
        where: { gatewayId, canal, tipo: 'TEMPERATURA_ELEVADA', ativo: true },
      });

      if (!alertaAtivo) {
        const novoAlerta = await prisma.alerta.create({
          data: {
            gatewayId,
            canal,
            tipo: 'TEMPERATURA_ELEVADA',
            mensagem: `Câmara de resfriados acima de 7°C (${valorFinal.toFixed(1)}°C)`,
            inicio: dataTimestamp,
            ativo: true,
          },
        });

        transmitirMensagem('ALERTA', novoAlerta);

        enviarEmailNotificacao({
          tipoEvento: 'INSTANTANEO',
          tag: config.tag,
          ativoNome: config.descricao || config.tag,
          titulo: `Temperatura da Câmara Fora da Faixa`,
          detalheOuDiagnostico: `A temperatura atingiu ${valorFinal.toFixed(1)}°C (limite máximo tolerado: ${LIMITE_TEMP}°C).`,
          acaoRecomendada: `Verificar se as portas foram mantidas abertas ou se há falha na válvula de expansão de amônia.`,
          valorAtual: valorFinal.toFixed(1),
          unidade: '°C',
        });
      }
    } else {
      await prisma.alerta.updateMany({
        where: { gatewayId, canal, tipo: 'TEMPERATURA_ELEVADA', ativo: true },
        data: { ativo: false, fim: dataTimestamp },
      });
    }
  }

  // --- 5. EXECUÇÃO DO MOTOR PREDITIVO EM TEMPO REAL ---
  if (config.tag) {
    analisarPrevisaoEEnviarNotificacao(config.tag).catch((err) =>
      console.error('Erro na análise preditiva em tempo real:', err)
    );
  }
}