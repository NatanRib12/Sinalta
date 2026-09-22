import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUser';
import logoImg from '../assets/marca/sinalta-simbolo.svg';
import { ArrowRight, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('otavio@valedocedro.com.br');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Por favor, preencha o e-mail e a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-6 text-[#14171C]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#14171C]/10 shadow-lg relative overflow-hidden">
        {/* Detalhe Superior de Destaque */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#14171C]" />

        {/* Brand Header */}
<div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C9096] hover:text-[#14171C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </div>

          {/* Logo clicável da Sinalta (Atua como botão para a Home) */}
          <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#14171C] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-105 transition-transform">
                <img src={logoImg}/>
              </div>
              <h1 className="text-2xl font-black text-[#14171C] tracking-tight">Sinalta</h1>
                <p className="text-xs text-[#8C9096] font-medium mt-1">
                  Plataforma de Monitoramento Industrial
                </p>
          </div>

        {/* Form de Acesso */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5B2E]/10 border border-[#FF5B2E]/30 rounded-xl text-xs text-[#FF5B2E] font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#14171C] mb-1.5 uppercase tracking-wider">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C9096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#F5F2EC]/60 border border-[#14171C]/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#14171C] focus:outline-none focus:border-[#14171C] focus:bg-white transition-all font-medium"
                placeholder="seu.email@empresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14171C] mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C9096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#F5F2EC]/60 border border-[#14171C]/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#14171C] focus:outline-none focus:border-[#14171C] focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#14171C] hover:bg-[#14171C]/90 text-[#F5F2EC] font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group text-sm"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer Informativo */}
        <div className="mt-8 pt-6 border-t border-[#14171C]/5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8C9096] bg-[#F5F2EC] px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F6F5C]" />
            <span>Acesso Restrito</span>
          </div>
        </div>
      </div>
    </div>
  );
};