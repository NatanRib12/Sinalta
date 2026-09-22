import React from 'react';
import { LeituraRecente } from '../services/api';
import { Thermometer, Zap, Gauge, AlertCircle, Check } from 'lucide-react';

interface TelemetryCardProps {
  data: LeituraRecente;
  onClick?: () => void;
  isSelected?: boolean;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ data, onClick, isSelected }) => {
  const { tag, descricao, unidade, alarmeAlto, leitura, online } = data || {};
  const valor = leitura?.valor ?? null;
  const temErro = !!leitura?.erro;

  const emAlerta = alarmeAlto !== null && valor !== null && valor > alarmeAlto;

  const getIcon = () => {
    const tagSafe = tag?.toUpperCase() || '';
    if (unidade === 'C' || tagSafe.includes('TMP')) {
      return <Thermometer className="w-4 h-4 text-[#FF5B2E] shrink-0" />;
    }
    if (unidade === 'A' || unidade === 'V' || tagSafe.includes('ELEC') || tagSafe.includes('KWH')) {
      return <Zap className="w-4 h-4 text-[#1F6F5C] shrink-0" />;
    }
    return <Gauge className="w-4 h-4 text-[#14171C] shrink-0" />;
  };

  const formattedValue = valor !== null && !temErro ? valor.toFixed(1) : '--';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 cursor-pointer transition-all border shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-[#14171C] ring-2 ring-[#14171C]/10'
          : 'border-[#14171C]/10 hover:border-[#14171C]/30'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-[#F5F2EC] flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs text-[#14171C] tracking-tight truncate">
                {tag || 'CANAL'}
              </h3>
              <p className="text-[10px] text-[#8C9096] truncate" title={descricao || ''}>
                {descricao || 'Telemetria'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {!online ? (
              <span className="text-[10px] font-semibold bg-[#F5F2EC] text-[#8C9096] px-2 py-0.5 rounded-full border border-[#14171C]/10 whitespace-nowrap block">
                Offline
              </span>
            ) : temErro ? (
              <span className="text-[10px] font-semibold bg-[#FF5B2E]/10 text-[#FF5B2E] px-2 py-0.5 rounded-full border border-[#FF5B2E]/20 flex items-center gap-1 whitespace-nowrap">
                <AlertCircle className="w-3 h-3 shrink-0" /> Erro
              </span>
            ) : emAlerta ? (
              <span className="text-[10px] font-semibold bg-[#FF5B2E]/10 text-[#FF5B2E] px-2 py-0.5 rounded-full border border-[#FF5B2E]/20 flex items-center gap-1 whitespace-nowrap">
                Alto
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-[#1F6F5C]/10 text-[#1F6F5C] px-2 py-0.5 rounded-full border border-[#1F6F5C]/20 flex items-center gap-1 whitespace-nowrap">
                <Check className="w-3 h-3 shrink-0" /> Normal
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#14171C]/5">
          <span className="text-2xl font-extrabold text-[#14171C] tracking-tight">
            {formattedValue}
          </span>
          <span className="text-xs font-semibold text-[#8C9096]">{unidade || ''}</span>
        </div>

        {alarmeAlto !== null && (
          <div className="mt-2 text-[10px] text-[#8C9096] flex justify-between font-medium">
            <span>Limite alarme:</span>
            <span className="text-[#14171C] font-semibold">
              {alarmeAlto} {unidade}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};