import React from 'react';
import { useAuth } from '../context/AuthContextUser';
import { useWS } from '../context/WSContext';
import logoImg from '../assets/marca/sinalta-simbolo.svg';
import { Link } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, alertas } = useWS();

  const alertasAtivos = alertas.filter((a) => a.ativo).length;

  return (
    <header className="bg-[#F5F2EC] border-b border-[#14171C]/10 px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Logotipo e Identificação */}
      <div className="flex items-center gap-3">
        <Link to="/">
          <div className="w-10 h-10 rounded-xl bg-[#14171C] text-[#F5F2EC] flex items-center justify-center font-bold text-lg shadow-sm">
            <img src={logoImg}/>
          </div>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold bg-[#14171C]/5 text-[#8C9096] px-2 py-0.5 rounded-full border border-[#14171C]/10">
              {user?.empresa || 'Laticínio Vale do Cedro'}
            </span>
          </div>
          <p className="text-xs text-[#8C9096]">Monitoramento Industrial</p>
        </div>
      </div>

      {/* Controles e Perfil */}
      <div className="flex items-center gap-4">
        {/* Connection Badge */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-[#14171C]/10 shadow-sm text-xs font-medium text-[#14171C]">
          {isConnected ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F5C] animate-pulse" />
              <span>Ao vivo</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B2E]" />
              <span className="text-[#8C9096]">Reconectando</span>
            </>
          )}
        </div>

        {/* Notificações de Alerta */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-sm text-xs font-semibold transition-all ${
            alertasAtivos > 0
              ? 'bg-[#FF5B2E]/10 border-[#FF5B2E]/30 text-[#FF5B2E]'
              : 'bg-white border-[#14171C]/10 text-[#1F6F5C]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{alertasAtivos} {alertasAtivos === 1 ? 'Alerta' : 'Alertas'}</span>
        </div>

        {/* Usuário */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#14171C]/10">
          <div className="w-9 h-9 rounded-full bg-[#14171C] text-[#F5F2EC] font-semibold text-xs flex items-center justify-center">
            {user?.nome ? user.nome.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#14171C]">{user?.nome || 'Operador'}</p>
            <p className="text-[11px] text-[#8C9096]">Acesso Ativo</p>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="p-2 text-[#8C9096] hover:text-[#14171C] hover:bg-white rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};