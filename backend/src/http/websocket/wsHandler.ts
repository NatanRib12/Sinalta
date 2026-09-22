import { WebSocket } from 'ws';

const clientesConectados = new Set<WebSocket>();

/**
 * Registra uma nova conexão WebSocket vinda do frontend
 */
export function handleWebSocketConnection(socket: WebSocket) {
  clientesConectados.add(socket);

  socket.on('close', () => {
    clientesConectados.delete(socket);
  });

  socket.on('error', (err) => {
    console.error('Erro na conexão WebSocket:', err);
    clientesConectados.delete(socket);
  });
}

/**
 * Transmite mensagens em tempo real para todos os navegadores conectados
 */
export function transmitirMensagem(tipo: 'LEITURA' | 'ALERTA' | 'ESTADO', dados: any) {
  const payload = JSON.stringify({ tipo, dados, timestamp: new Date() });

  for (const client of clientesConectados) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}