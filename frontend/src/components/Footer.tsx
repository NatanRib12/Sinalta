import React from 'react';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import logoNegativo from '../assets/marca/sinalta-negativo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#14171C] text-[#F5F2EC] pt-16 pb-8 px-8 border-t border-[#8C9096]/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#8C9096]/15">
        
        {/* Coluna 1 (Esquerda): Espaço para a Logo da Empresa */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center h-10">
            {/* Tag da Logo apontando para o seu SVG em assets/marca */}
            <img
              src={logoNegativo}
              alt="Sinalta Telemetria Industrial"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                // Fallback em código caso o arquivo SVG ainda esteja carregando
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <span class="text-2xl font-black tracking-tight text-[#F5F2EC] flex items-center">
                    SINALTA<span class="text-[#FF5B2E] text-3xl leading-none ml-0.5">.</span>
                  </span>
                `;
              }}
            />
          </div>
          <p className="text-xs text-[#8C9096] font-medium leading-relaxed">
            São Paulo, SP · Brasil<br />
            Monitoramento & Ingestão de Telemetria Industrial
          </p>
        </div>

        {/* Coluna 2 (Meio): Exclusivo Contato WhatsApp */}
        <div className="md:col-span-3 space-y-3">
          <span className="text-[11px] font-bold tracking-widest text-[#8C9096] uppercase block">
            Contato
          </span>
          <a
            href="https://wa.me/5511977707995"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#F5F2EC] hover:text-[#FF5B2E] transition-colors group"
          >
            <div className="p-2 rounded-xl bg-[#F5F2EC]/5 border border-[#F5F2EC]/10 group-hover:border-[#FF5B2E]/30 transition-colors">
              <MessageSquare className="w-4 h-4 text-[#1F6F5C] group-hover:text-[#FF5B2E] transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8C9096] font-normal">Atendimento Comercial</span>
              <span className="flex items-center gap-1">
                WhatsApp: (31) 90000-0000
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </span>
            </div>
          </a>
        </div>

        {/* Coluna 3 (Direita): Slogan Inspirador */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-[11px] font-bold tracking-widest text-[#8C9096] uppercase block">
            Propósito
          </span>
          <p className="text-base font-semibold text-[#F5F2EC] leading-snug tracking-tight">
            “Transformando ruídos fabris em inteligência acionável. A clareza e a previsibilidade que sua planta precisa para produzir sem interrupções.”
          </p>
        </div>

      </div>

      {/* Rodapé Inferior com Direitos Reservados */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#8C9096] font-medium">
        <p>© {new Date().getFullYear()} Sinalta · Todos os direitos reservados.</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1F6F5C]"></span>
          <span>Rede de Sensores Operacional</span>
        </div>
      </div>
    </footer>
  );
};