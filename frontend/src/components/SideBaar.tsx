import React, { useState } from 'react';
import { useWS } from '../context/WSContext';
import { Thermometer, Activity, Clock, CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const LogsSidebar: React.FC = () => {
  const { alertas } = useWS();
  const [abaAtiva, setAbaAtiva] = useState<'CAMARAS' | 'COMPRESSORES'>('CAMARAS');
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Filtra os logs acumulados de acordo com a aba selecionada
  const logsCamaras = alertas.filter(
    (a) =>
      a.tipo === 'TEMPERATURA_ELEVADA' ||
      a.mensagem?.toUpperCase().includes('CF-') ||
      a.mensagem?.toLowerCase().includes('câmara')
  );

  const logsCompressores = alertas.filter(
    (a) =>
      a.tipo === 'VIBRACAO_ELEVADA' ||
      a.mensagem?.toUpperCase().includes('CMP-') ||
      a.mensagem?.toLowerCase().includes('compressor')
  );

  const logsExibidos = abaAtiva === 'CAMARAS' ? logsCamaras : logsCompressores;

  const formatarDataHora = (isoString: string) => {
    if (!isoString) return '--:--';
    const data = new Date(isoString);
    if (isNaN(data.getTime())) return '--:--';
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <aside
      className={`bg-white border-r border-[#14171C]/10 flex flex-col transition-all duration-300 relative shrink-0 ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Botão para recolher/expandir o menu lateral */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-[#14171C] text-white p-1 rounded-full shadow-md z-20 hover:scale-110 transition-transform"
        title={isOpen ? 'Recolher Menu Lateral' : 'Expandir Menu Lateral'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen ? (
        <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
          {/* Título do Menu Lateral */}
          <div className="flex items-center gap-2 pb-3 border-b border-[#14171C]/10">
            <FileText className="w-5 h-5 text-[#14171C]" />
            <div>
              <h3 className="font-extrabold text-sm text-[#14171C] tracking-tight">Registro de Ocorrências</h3>
              <p className="text-[10px] text-[#8C9096]">Logs acumulados do sistema</p>
            </div>
          </div>

          {/* Abas Principais: Câmaras vs Compressores */}
          <div className="grid grid-cols-2 gap-1 bg-[#F5F2EC] p-1 rounded-xl border border-[#14171C]/5">
            <button
              onClick={() => setAbaAtiva('CAMARAS')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                abaAtiva === 'CAMARAS'
                  ? 'bg-white text-[#14171C] shadow-sm'
                  : 'text-[#8C9096] hover:text-[#14171C]'
              }`}
            >
              <span>Câmaras</span>
              <span className="text-[10px] bg-[#14171C]/10 px-1.5 py-0.2 rounded-full ml-0.5">
                {logsCamaras.length}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('COMPRESSORES')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                abaAtiva === 'COMPRESSORES'
                  ? 'bg-white text-[#14171C] shadow-sm'
                  : 'text-[#8C9096] hover:text-[#14171C]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#1F6F5C]" />
              <span>Compressores</span>
              <span className="text-[10px] bg-[#14171C]/10 px-1.5 py-0.2 rounded-full ml-0.5">
                {logsCompressores.length}
              </span>
            </button>
          </div>

          {/* Lista de Logs Acumulados */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {logsExibidos.length === 0 ? (
              <div className="text-center py-12 text-xs font-medium text-[#8C9096] bg-[#F5F2EC]/50 rounded-xl p-4 border border-dashed border-[#14171C]/10">
                Nenhum log registrado para {abaAtiva === 'CAMARAS' ? 'Câmaras' : 'Compressores'}.
              </div>
            ) : (
              logsExibidos.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 relative overflow-hidden ${
                    log.ativo
                      ? 'bg-[#FF5B2E]/5 border-[#FF5B2E]/30'
                      : 'bg-white border-[#14171C]/10 hover:border-[#14171C]/20'
                  }`}
                >
                  {/* Borda indicadora de status */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      log.ativo ? 'bg-[#FF5B2E]' : 'bg-[#1F6F5C]'
                    }`}
                  />

                  <div className="flex items-center justify-between pl-1">

                    <span className="text-[10px] text-[#8C9096] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatarDataHora(log.inicio)}
                    </span>
                  </div>

                  <p className="font-semibold text-[#14171C] pl-1 leading-snug">
                    {log.mensagem}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Estado Recolhido (Apenas Ícones) */
        <div className="flex flex-col items-center py-6 space-y-6">
          <FileText className="w-5 h-5 text-[#14171C]" />
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setAbaAtiva('CAMARAS');
                setIsOpen(true);
              }}
              className="p-2 rounded-xl bg-[#F5F2EC] text-[#FF5B2E] hover:scale-110 transition-transform"
              title="Logs de Câmaras"
            >
              <Thermometer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAbaAtiva('COMPRESSORES');
                setIsOpen(true);
              }}
              className="p-2 rounded-xl bg-[#F5F2EC] text-[#1F6F5C] hover:scale-110 transition-transform"
              title="Logs de Compressores"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};