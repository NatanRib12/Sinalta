import React, { useState } from 'react';
import { Header } from '../components/Header';
import { AlertBanner } from '../components/AlertBanner';
import { SVG2D } from '../components/SVG2D';
import { TelemetryCard } from '../components/TelemetryCardData';
import { PredictivePanel } from '../components/PredictivePanel';
import { LogsSidebar } from '../components/SideBaar'; 
import { useWS } from '../context/WSContext';
import { Filter, Layers } from 'lucide-react';
import { LeituraRecente } from '../services/api';

const dataField = [
  'CF-01-TMP',
  'CF-02-TMP',
  'CMP-01-VIB',
  'CMP-02-VIB',
];

const MOCK_FALLBACK: Record<string, LeituraRecente> = {
  'CF-01-TMP': { gatewayId: 'KG100', canal: 1, tag: 'CF-01-TMP', descricao: 'Câmara 01 Resfriados', grandeza: 'temperatura', unidade: '°C', tipo: 'instantaneo', alarmeAlto: 7.0, online: false, leitura: null },
  'CF-02-TMP': { gatewayId: 'KG200', canal: 1, tag: 'CF-02-TMP', descricao: 'Câmara 02 Congelados', grandeza: 'temperatura', unidade: '°C', tipo: 'instantaneo', alarmeAlto: 7.0, online: false, leitura: null },
  'CMP-01-VIB': { gatewayId: 'KG200', canal: 2, tag: 'CMP-01-VIB', descricao: 'Compressor 01 Vibração', grandeza: 'vibracao_rms', unidade: 'mm/s', tipo: 'instantaneo', alarmeAlto: 7.1, online: false, leitura: null },
  'CMP-02-VIB': { gatewayId: 'KG200', canal: 3, tag: 'CMP-02-VIB', descricao: 'Compressor 02 Vibração', grandeza: 'vibracao_rms', unidade: 'mm/s', tipo: 'instantaneo', alarmeAlto: 7.1, online: false, leitura: null }
};

export const DashboardPage: React.FC = () => {
  const { leituras } = useWS();
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const listaLeituras = dataField.map((tag) => {
    const itemEncontrado = Object.values(leituras).find(
      (l) => l?.tag && l.tag.toUpperCase().trim() === tag
    );
    return itemEncontrado || MOCK_FALLBACK[tag];
  });

  const leiturasExibidas = selectedTag
    ? listaLeituras.filter((l) =>
        l?.tag?.toUpperCase().trim().startsWith(selectedTag.toUpperCase().trim())
      )
    : listaLeituras;

  const nomeFiltroExibido =
    selectedTag === 'CF' ? 'Câmaras' : selectedTag === 'CMP' ? 'Compressores' : selectedTag;

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#14171C] flex flex-col font-sans">
      <Header />

      {/* Disposição em duas colunas: Menu Lateral à Esquerda + Conteúdo à Direita */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu Lateral de Logs Acumulados */}
        <LogsSidebar />

        {/* Área Principal de Monitoramento */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">

          {/* Planta Baixa Interativa */}
          <SVG2D
            selectedAssetTag={selectedTag}
            onSelectAsset={(tag) => {
              setSelectedTag((prev) => (prev === tag ? undefined : tag));
            }}
          />

          {/* Grid dos 5 Canais Essenciais */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#14171C] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#14171C]" />
                  Canais de Telemetria Ativos
                </h2>
                <p className="text-xs text-[#8C9096]">
                  Monitoramento em tempo real dos 5 ativos essenciais da planta.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(undefined)}
                    className="text-xs font-semibold bg-white text-[#FF5B2E] border border-[#FF5B2E]/30 px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-[#FF5B2E]/5 transition-all"
                  >
                    <Filter className="w-3.5 h-3.5" /> Limpar Filtro ({nomeFiltroExibido})
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leiturasExibidas.map((item) => (
                <TelemetryCard
                  key={`${item.gatewayId}_${item.canal}_${item.tag}`}
                  data={item}
                  isSelected={
                    !!selectedTag &&
                    !!item.tag &&
                    item.tag.toUpperCase().trim().startsWith(selectedTag.toUpperCase().trim())
                  }
                  onClick={() =>
                    setSelectedTag((prev) => (prev === item.tag ? undefined : item.tag))
                  }
                />
              ))}
            </div>
          </div>

          {/* Painel de Inteligência Preditiva */}
          <PredictivePanel />
        </main>
      </div>
    </div>
  );
};