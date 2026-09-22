import React from 'react';
import { useWS } from '../context/WSContext';
import { Thermometer, Activity, Box, Check, AlertCircle } from 'lucide-react';

interface SVG2DProps {
  selectedAssetTag?: string;
  onSelectAsset?: (tag: string) => void;
}

export const SVG2D: React.FC<SVG2DProps> = ({ selectedAssetTag, onSelectAsset }) => {
  const { leituras, alertas } = useWS();

  const getLeituraPorTag = (tagBuscada: string) => {
    const tagLimpa = tagBuscada.toUpperCase().trim();
    return Object.values(leituras).find(
      (item) => item.tag && item.tag.toUpperCase().trim() === tagLimpa
    );
  };

  const getValorFormatado = (tag: string, unidadePadrao: string) => {
    const item = getLeituraPorTag(tag);
    if (
      !item ||
      !item.leitura ||
      item.leitura.valor === null ||
      item.leitura.valor === undefined ||
      item.leitura.erro
    ) {
      return `-- ${unidadePadrao}`;
    }
    return `${item.leitura.valor.toFixed(1)} ${item.unidade || unidadePadrao}`;
  };

  const statusCamara = () => {
    const temAlerta = alertas.some(
      (a) =>
        a.ativo &&
        (a.tipo === 'TEMPERATURA_ELEVADA' ||
          a.mensagem.includes('CF-') ||
          a.mensagem.toLowerCase().includes('câmara'))
    );
    if (temAlerta) return 'CRITICO';

    const itemC1 = getLeituraPorTag('CF-01-TMP');
    const itemC2 = getLeituraPorTag('CF-02-TMP');
    if (itemC1?.leitura?.erro || itemC2?.leitura?.erro) return 'ATENCAO';

    return 'NORMAL';
  };

  const statusCompressores = () => {
    const temAlerta = alertas.some(
      (a) =>
        a.ativo &&
        (a.tipo === 'VIBRACAO_ELEVADA' ||
          a.mensagem.includes('CMP-') ||
          a.mensagem.toLowerCase().includes('compressor'))
    );
    return temAlerta ? 'CRITICO' : 'NORMAL';
  };

  const estadoCamara = statusCamara();
  const estadoCompressores = statusCompressores();

  return (
    <div className="bg-white border border-[#14171C]/10 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#14171C]/5">
        <div>
          <h2 className="text-base font-bold text-[#14171C] flex items-center gap-2">
            <Box className="w-5 h-5 text-[#14171C]" />
            Planta · Laticínio Vale do Cedro
          </h2>
          <p className="text-xs text-[#8C9096] mt-0.5">
            Monitoramento de ativos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-[#8C9096]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F5C]" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B2E] animate-pulse" />
            <span>Atenção / Alerta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#F5F2EC] p-4 rounded-xl border border-[#14171C]/5">
        
        {/* Setor 1: CÂMARA DE RESFRIADOS (Filtra todos os canais 'CF') */}
        <div
          onClick={() => onSelectAsset?.('CF')}
          className={`md:col-span-6 bg-white rounded-xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            selectedAssetTag === 'CF'
              ? 'border-[#14171C] ring-2 ring-[#14171C]/10 shadow-md'
              : 'border-[#14171C]/10 hover:border-[#14171C]/30'
          }`}
        >
          {estadoCamara !== 'NORMAL' && (
            <div className="absolute top-0 right-0 w-2 h-full bg-[#FF5B2E]" />
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C9096] bg-[#F5F2EC] px-2.5 py-1 rounded-md">
                Câmaras
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                estadoCamara !== 'NORMAL'
                  ? 'bg-[#FF5B2E]/10 text-[#FF5B2E]'
                  : 'bg-[#1F6F5C]/10 text-[#1F6F5C]'
              }`}>
                {estadoCamara !== 'NORMAL' ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {estadoCamara !== 'NORMAL' ? 'Alerta / Atenção' : 'Operativo'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${estadoCamara !== 'NORMAL' ? 'bg-[#FF5B2E]/10 text-[#FF5B2E]' : 'bg-[#F5F2EC] text-[#14171C]'}`}>
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#14171C]">Câmara de Resfriados 01 & 02</h3>
                <p className="text-xs text-[#8C9096]">Monitoramento de Temperatura</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#14171C]/5">
            <div className="bg-[#F5F2EC]/60 p-3 rounded-lg">
              <span className="text-[10px] font-medium text-[#8C9096] block">Câmara 01</span>
              <span className="text-base font-extrabold text-[#14171C]">
                {getValorFormatado('CF-01-TMP', '°C')}
              </span>
            </div>
            <div className="bg-[#F5F2EC]/60 p-3 rounded-lg">
              <span className="text-[10px] font-medium text-[#8C9096] block">Câmara 02</span>
              <span className="text-base font-extrabold text-[#14171C]">
                {getValorFormatado('CF-02-TMP', '°C')}
              </span>
            </div>
          </div>
        </div>

        {/* Setor 2: SALA DE COMPRESSORES (Filtra todos os canais 'CMP') */}
        <div
          onClick={() => onSelectAsset?.('CMP')}
          className={`md:col-span-6 bg-white rounded-xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            selectedAssetTag === 'CMP'
              ? 'border-[#14171C] ring-2 ring-[#14171C]/10 shadow-md'
              : 'border-[#14171C]/10 hover:border-[#14171C]/30'
          }`}
        >
          {estadoCompressores !== 'NORMAL' && (
            <div className="absolute top-0 right-0 w-2 h-full bg-[#FF5B2E]" />
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C9096] bg-[#F5F2EC] px-2.5 py-1 rounded-md">
                Compressores
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                estadoCompressores !== 'NORMAL'
                  ? 'bg-[#FF5B2E]/10 text-[#FF5B2E]'
                  : 'bg-[#1F6F5C]/10 text-[#1F6F5C]'
              }`}>
                {estadoCompressores !== 'NORMAL' ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {estadoCompressores !== 'NORMAL' ? 'Vibração Alta' : 'Operativo'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${estadoCompressores !== 'NORMAL' ? 'bg-[#FF5B2E]/10 text-[#FF5B2E]' : 'bg-[#F5F2EC] text-[#14171C]'}`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#14171C]">Compressores de Amônia</h3>
                <p className="text-xs text-[#8C9096]">Monitoramento de Vibração RMS</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#14171C]/5">
            <div className="bg-[#F5F2EC]/60 p-3 rounded-lg">
              <span className="text-[10px] font-medium text-[#8C9096] block">Compressor 01</span>
              <span className="text-base font-extrabold text-[#14171C]">
                {getValorFormatado('CMP-01-VIB', 'mm/s')}
              </span>
            </div>
            <div className="bg-[#F5F2EC]/60 p-3 rounded-lg">
              <span className="text-[10px] font-medium text-[#8C9096] block">Compressor 02</span>
              <span className="text-base font-extrabold text-[#14171C]">
                {getValorFormatado('CMP-02-VIB', 'mm/s')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};