import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { LeituraRecente, Alerta, telemetryService } from '../services/api';

interface WSContextType {
  leituras: Record<string, LeituraRecente>;
  alertas: Alerta[];
  isConnected: boolean;
  carregarDadosIniciais: () => Promise<void>;
}

interface WSProviderProps {
  children: ReactNode;
}

const WSContext = createContext<WSContextType>({} as WSContextType);

export const WSProvider: React.FC<WSProviderProps> = ({ children }: WSProviderProps) => {
  const [leituras, setLeituras] = useState<Record<string, LeituraRecente>>({});
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const carregarDadosIniciais = useCallback(async () => {
    try {
      const [recentesData, alertasData]: [LeituraRecente[], Alerta[]] = await Promise.all([
        telemetryService.getLeiturasRecentes(),
        telemetryService.getAlertas(),
      ]);

      const mapaLeituras: Record<string, LeituraRecente> = {};
      recentesData.forEach((item: LeituraRecente) => {
        mapaLeituras[`${item.gatewayId}_${item.canal}`] = item;
      });

      setLeituras(mapaLeituras);
      setAlertas(alertasData);
    } catch (err) {
      console.error('Erro ao carregar dados iniciais da API:', err);
    }
  }, []);

  useEffect(() => {
    carregarDadosIniciais();

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket('ws://localhost:3000/ws');

      ws.onopen = () => {
        setIsConnected(true);
        console.log('⚡ Conectado ao WebSocket da Sinalta');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.tipo === 'LEITURA') {
            const l = payload.dados;
            const key = `${l.gatewayId}_${l.canal}`;

            setLeituras((prev) => {
              const itemAtual = prev[key];

              // Se o canal já existe no estado, atualiza a leitura interna
              if (itemAtual) {
                return {
                  ...prev,
                  [key]: {
                    ...itemAtual,
                    leitura: {
                      id: l.id,
                      gatewayId: l.gatewayId,
                      canal: l.canal,
                      seq: l.seq,
                      timestamp: l.timestamp,
                      valor: l.valor,
                      erro: l.erro,
                    },
                  },
                };
              }

              // Se o canal ainda não existia no estado local, recarrega a lista completa da API
              carregarDadosIniciais();
              return prev;
            });
          }

          if (payload.tipo === 'ALERTA') {
            const novoAlerta: Alerta = payload.dados;
            setAlertas((prev) => {
              const existeIndex = prev.findIndex((a) => a.id === novoAlerta.id);
              if (existeIndex >= 0) {
                const copia = [...prev];
                copia[existeIndex] = novoAlerta;
                return copia;
              }
              return [novoAlerta, ...prev];
            });
          }
        } catch (e) {
          console.error('Erro ao processar mensagem do WebSocket:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [carregarDadosIniciais]);

  return (
    <WSContext.Provider value={{ leituras, alertas, isConnected, carregarDadosIniciais }}>
      {children}
    </WSContext.Provider>
  );
};

export const useWS = () => useContext(WSContext);