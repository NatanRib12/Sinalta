import React from 'react';
import { useWS } from '../context/WSContext';
import { AlertCircle, Thermometer, Activity, Clock } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { alertas, leituras } = useWS();
  const alertasAtivos = alertas.filter((a) => a.ativo);

  if (alertasAtivos.length === 0) return null;

  // Descobre o timestamp mais recente recebido pelo simulador para usar como tempo base
  const timestampsLeituras = Object.values(leituras)
    .map((l) => (l?.leitura?.timestamp ? new Date(l.leitura.timestamp).getTime() : 0))
    .filter((ts) => ts > 0);

  const tempoSimulacao = timestampsLeituras.length > 0 
    ? Math.max(...timestampsLeituras) 
    : Date.now();

  // Função igual a um relógio (Formata minutos para Horas + Minutos ao atingir 60 min)
  const formatarTempoDecorrito = (totalMinutos: number) => {
    if (totalMinutos <= 0) return 'menos de 1 min';
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    // Se for menos de 1 hora (ex: "45 min")
    if (horas === 0) {
      return `${minutos} min`;
    }

    // Se for 1 hora ou mais (ex: "1h 00min", "1h 05min", "2h 15min")
    const minutosFormatados = minutos < 10 ? `0${minutos}` : `${minutos}`;
    return `${horas}h ${minutosFormatados}min`;
  };

  return (
    <div className="space-y-3 mb-6">
      {alertasAtivos.map((alerta) => {
        const isTemperatura = alerta.tipo === 'TEMPERATURA_ELEVADA';
        const dataInicio = new Date(alerta.inicio);

        const horaInicio = !isNaN(dataInicio.getTime())
          ? dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '--:--';

        // Calcula os minutos decorridos com base na simulação
        const diffMs = tempoSimulacao - dataInicio.getTime();
        const totalMinutos = diffMs > 0 
          ? Math.floor(diffMs / 60000) 
          : (alerta as any).minutosDecorridos || 0;

        // Limpa resíduos de texto antigo que possam estar salvos na coluna da mensagem
        const mensagemLimpa = alerta.mensagem
          .replace(/\(Há [^)]+\)/gi, '')
          .replace(/há \d+ minutos?/gi, '')
          .trim();

        const tempoFormatado = formatarTempoDecorrito(totalMinutos);

        return (
          <div
            key={alerta.id}
            className="bg-white border border-[#FF5B2E]/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden"
          >
            {/* Faixa lateral de destaque */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF5B2E]" />

            <div className="p-3 rounded-xl bg-[#FF5B2E]/10 text-[#FF5B2E] shrink-0">
              {isTemperatura ? (
                <Thermometer className="w-6 h-6 animate-pulse" />
              ) : (
                <Activity className="w-6 h-6 animate-pulse" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#14171C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FF5B2E]" />
                  {isTemperatura ? 'Atenção na Câmara de Resfriados' : 'Vibração Elevada no Compressor'}
                </h4>
                <span className="text-xs font-medium text-[#8C9096] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Início às {horaInicio}
                </span>
              </div>
              <p className="text-xs text-[#8C9096] mt-1 font-medium">
                {mensagemLimpa} {totalMinutos > 0 ? `(Há ${tempoFormatado})` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};