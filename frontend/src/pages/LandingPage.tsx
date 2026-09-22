import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { telemetryService, ResumoPublico } from '../services/api';
import sinaltaTitle  from "../assets/marca/sinalta.svg";
import { Footer } from '../components/Footer';
import { ArrowRight, ShieldCheck, Activity, Cpu, CheckCircle2, Phone } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoPublico | null>(null);

  useEffect(() => {
    telemetryService
      .getResumoPublico()
      .then(setResumo)
      .catch((err) => console.error('Erro ao buscar resumo público:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#14171C] font-sans">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <img width="150px" height="150px" src={sinaltaTitle} alt="logoimg"/>
        </div>

        <Link
          to="/login"
          className="bg-[#14171C] hover:bg-[#14171C]/90 text-[#F5F2EC] text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <span>Área do Cliente</span>
          <ArrowRight className="w-4 h-4 text-[#FF5B2E]" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-[#14171C]/10 px-4 py-1.5 rounded-full text-xs font-bold text-[#14171C]">
            <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
            Telemetria Industrial & IoT de Alta Precisão
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#14171C] leading-tight tracking-tight">
            Sua fábrica inteligente, sem ruídos e sem perdas.
          </h1>

          <p className="text-base text-[#8C9096] leading-relaxed max-w-2xl font-medium">
            Monitoramento contínuo em tempo real para indústrias.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://wa.me/31900000000"
              target="_blank"
              rel="noreferrer"
              className="bg-white text-[#14171C] border border-[#14171C]/10 font-bold px-6 py-4 rounded-xl text-sm hover:bg-[#F5F2EC] transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#1F6F5C]" />
              Falar com Consultor
            </a>
            <div
               className="bg-[#14171C] text-[#F5F2EC] font-bold px-7 py-4 rounded-xl text-sm hover:bg-[#14171C]/90 transition-all shadow-lg flex items-center gap-2"
            >
               <span>Exibição em tempo real de um de nossos clientes</span>
               <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Widget do Status em Tempo Real da Planta */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#14171C]/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#14171C]/5">
            <div>
              <h3 className="font-bold text-sm text-[#14171C]">Rede Sinalta em Operação</h3>
              <p className="text-xs text-[#8C9096]">Laticínio Vale do Cedro</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-[#1F6F5C] animate-ping" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F2EC] p-4 rounded-2xl">
              <Cpu className="w-5 h-5 text-[#14171C] mb-2" />
              <span className="text-2xl font-black text-[#14171C] block">
                {resumo ? resumo.gatewaysOnline : '--'}
              </span>
              <span className="text-[11px] font-semibold text-[#8C9096]">Gateways Online</span>
            </div>

            <div className="bg-[#F5F2EC] p-4 rounded-2xl">
              <Activity className="w-5 h-5 text-[#FF5B2E] mb-2" />
              <span className="text-2xl font-black text-[#14171C] block">
                {resumo ? resumo.alertasAtivos : '--'}
              </span>
              <span className="text-[11px] font-semibold text-[#8C9096]">Alertas Ativos</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#14171C]/5 flex items-center justify-between text-xs font-semibold text-[#1F6F5C]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Status: Operação Estável
            </span>
            <span className="text-[10px] text-[#8C9096]">
              Atualizado às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </section>

      {/* Planos Comerciais */}
      <section className="max-w-7xl mx-auto px-8 py-16 border-t border-[#14171C]/10">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-[#14171C]">Planos Sob Medida para Sua Fábrica</h2>
          <p className="text-xs text-[#8C9096] mt-1">Conectividade IoT com suporte completo a regras de alarme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-[#14171C]/10 space-y-4">
            <h3 className="font-bold text-lg text-[#14171C]">Essencial</h3>
            <p className="text-2xl font-black text-[#14171C]">R$ 390 <span className="text-xs font-normal text-[#8C9096]">/mês</span></p>
            <ul className="text-xs space-y-2 text-[#8C9096] pt-2">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Valor Cobrado Por Máquina</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Monitoramento e Alertas</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-[#14171C] shadow-lg space-y-4 relative">
            <span className="absolute -top-3 right-6 bg-[#FF5B2E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Completo</span>
            <h3 className="font-bold text-lg text-[#14171C]">Plano Industrial</h3>
            <p className="text-2xl font-black text-[#14171C]">R$ 690 <span className="text-xs font-normal text-[#8C9096]">/mês</span></p>
            <ul className="text-xs space-y-2 text-[#14171C] font-medium pt-2">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Valor Cobrado Por Máquina</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Tudo do Essencial</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Relatórios Mensais</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F6F5C]" /> Visita Técnica Trimestral</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#14171C]/10 space-y-4">
            <h3 className="font-bold text-lg text-[#14171C]">Planta Inteira</h3>
            <p className="text-2xl font-black text-[#14171C]">Sob Consulta</p>
            <ul className="text-xs space-y-2 text-[#8C9096] pt-2">
              <li className="flex items-center gap-2">
                <a
                 href="https://wa.me/5511999999999"
                 target="_blank"
                 rel="noreferrer"
                 className="bg-white text-[#14171C] border border-[#14171C]/10 font-bold px-6 py-4 rounded-xl text-sm hover:bg-[#F5F2EC] transition-all flex items-center gap-2"
                >
                <Phone className="w-4 h-4 text-[#1F6F5C]" /> Falar com Consultor
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};