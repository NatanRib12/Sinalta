import React, { useEffect, useState, useCallback } from 'react';
import { telemetryService, PrevisaoFalha } from '../services/api';
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, Wrench, Clock, ShieldCheck } from 'lucide-react';

export const PredictivePanel: React.FC = () => {
  const [previsoes, setPrevisoes] = useState<PrevisaoFalha[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarPrevisoes = useCallback(async () => {
    try {
      const data = await telemetryService.getPrevisoes();
      setPrevisoes(data);
    } catch (err) {
      console.error('Erro ao carregar análise preditiva:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPrevisoes();
    const interval = setInterval(carregarPrevisoes, 12000);
    return () => clearInterval(interval);
  }, [carregarPrevisoes]);

  const previsoesComRisco = previsoes.filter((p) => p.risco !== 'NORMAL');

  return (
    <div className="bg-white border border-[#14171C]/10 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#14171C]/5">
        <div>
          <h3 className="text-base font-bold text-[#14171C] flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#FF5B2E]" />
            Painel de Inteligência Preditiva & Saúde dos Ativos
          </h3>
          <p className="text-xs text-[#8C9096]">
            Projeções estatísticas de falha e ações preventivas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {previsoesComRisco.length > 0 ? (
            <span className="text-xs font-bold text-[#FF5B2E] bg-[#FF5B2E]/10 border border-[#FF5B2E]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {previsoesComRisco.length} Ativo(s) Requerem Atenção
            </span>
          ) : (
            <span className="text-xs font-bold text-[#1F6F5C] bg-[#1F6F5C]/10 border border-[#1F6F5C]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Operacional
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs font-medium text-[#8C9096]">
          Processando modelos preditivos da planta...
        </div>
      ) : previsoesComRisco.length === 0 ? (
        <div className="bg-[#F5F2EC]/60 border border-[#14171C]/5 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1F6F5C]/10 text-[#1F6F5C]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#14171C]">
                Todos os 4 Ativos com Comportamento Nominal
              </h4>
              <p className="text-xs text-[#8C9096] mt-0.5">
                Nenhum gradiente de subida anômalo detectado em temperaturas ou vibração.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {previsoesComRisco.map((item) => {
            const ehCritico = item.risco === 'CRITICO';

            return (
              <div
                key={item.tag}
                className={`bg-[#F5F2EC]/40 border rounded-xl p-4 transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  ehCritico
                    ? 'border-[#FF5B2E]/40 bg-[#FF5B2E]/5'
                    : 'border-[#FF9F2E]/40 bg-[#FF9F2E]/5'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    ehCritico ? 'bg-[#FF5B2E]' : 'bg-[#FF9F2E]'
                  }`}
                />

                <div className="pl-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-xs text-[#14171C] bg-white border border-[#14171C]/10 px-2 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ehCritico
                          ? 'bg-[#FF5B2E]/10 text-[#FF5B2E]'
                          : 'bg-[#FF9F2E]/10 text-[#FF9F2E]'
                      }`}
                    >
                      {ehCritico ? 'Risco Crítico' : 'Atenção Preditiva'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#14171C]">{item.ativoNome}</h4>
                </div>

                <div className="flex-1 text-xs text-[#14171C] font-semibold leading-relaxed">
                  {item.diagnostico}
                </div>

                {item.estimativaMinutosAteFalha !== null && (
                  <div className="flex items-center gap-3 text-xs bg-white border border-[#14171C]/10 p-2.5 rounded-xl shrink-0">
                    <div className="flex items-center gap-1 text-[#FF5B2E] font-bold">
                      <Clock className="w-4 h-4" />
                      <span>~{item.estimativaMinutosAteFalha} min</span>
                    </div>
                    <div className="h-4 w-px bg-[#14171C]/10" />
                    <div className="flex items-center gap-1 text-[#8C9096] font-semibold">
                      <TrendingUp className="w-4 h-4 text-[#14171C]" />
                      <span>{item.probabilidade}% prob.</span>
                    </div>
                  </div>
                )}

                <div className="lg:max-w-[280px] bg-white border border-[#1F6F5C]/20 p-2.5 rounded-xl text-[11px] text-[#1F6F5C] font-semibold flex items-start gap-2 shrink-0">
                  <Wrench className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{item.acaoRecomendada}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};