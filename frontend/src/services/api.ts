import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

export interface Gateway {
  serial: string;
  modelo: string;
  firmware: string;
  intervaloSec: number;
  online: boolean;
  configs: GatewayConfig[];
}

export interface GatewayConfig {
  id: string;
  gatewayId: string;
  canal: number;
  tag: string;
  descricao: string;
  grandeza: string | null;
  unidade: string | null;
  tipo: string;
  alarmeAlto: number | null;
  esc: number;
  sig: number;
}

export interface LeituraRecente {
  gatewayId: string;
  canal: number;
  tag: string;
  descricao: string;
  grandeza: string | null;
  unidade: string | null;
  tipo: string;
  alarmeAlto: number | null;
  online: boolean;
  leitura: {
    id: string;
    gatewayId: string;
    canal: number;
    seq: number;
    timestamp: string;
    valor: number | null;
    erro: string | null;
  } | null;
}

export interface Alerta {
  id: string;
  gatewayId: string;
  canal: number;
  tipo: string;
  mensagem: string;
  inicio: string;
  fim: string | null;
  ativo: boolean;
}

export interface ResumoPublico {
  totalGateways: number;
  gatewaysOnline: number;
  alertasAtivos: number;
  statusGeral: 'OPERANDO_NORMAL' | 'ATENCAO';
  atualizadoEm: string;
}

export interface PrevisaoFalha {
  tag: string;
  ativoNome: string;
  risco: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  tendencia: 'ESTAVEL' | 'ELEVACAO' | 'QUEDA';
  valorAtual: number;
  unidade: string;
  limiteAlarme: number | null;
  estimativaMinutosAteFalha: number | null;
  probabilidade: number;
  diagnostico: string;
  acaoRecomendada: string;
}

export const telemetryService = {
  getGateways: async (): Promise<Gateway[]> => {
    const response = await api.get('/api/gateways');
    return response.data;
  },

  getLeiturasRecentes: async (): Promise<LeituraRecente[]> => {
    const response = await api.get('/api/leituras/recentes');
    return response.data;
  },

  getHistorico: async (gatewayId?: string, canal?: number, limit = 200) => {
    const params: Record<string, any> = { limit };
    if (gatewayId) params.gatewayId = gatewayId;
    if (canal !== undefined) params.canal = canal;
    const response = await api.get('/api/leituras/historico', { params });
    return response.data;
  },

  getAlertas: async (): Promise<Alerta[]> => {
    const response = await api.get('/api/alertas');
    return response.data;
  },

  getResumoPublico: async (): Promise<ResumoPublico> => {
    const response = await api.get('/api/resumo-publico');
    return response.data;
  },

  getPrevisoes: async (): Promise<PrevisaoFalha[]> => {
    const response = await api.get('/api/previsoes');
    return response.data;
  },
};