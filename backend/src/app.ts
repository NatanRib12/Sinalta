import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { prisma } from './config/database';
import { telemetryRoutes } from './http/routes/telemetryRoutes';
import { alertRoutes } from './http/routes/alertRoutes';
import { publicRoutes } from './http/routes/publicRoutes';
import { handleWebSocketConnection } from './http/websocket/wsHandler';
import { startMQTTSubscriber } from './ingestor/mqttSubscriber';

const fastify = Fastify({ logger: true });

// Limpeza de inicialização no boot do backend
async function limparEstadoInicial() {
  try {
    await prisma.leitura.deleteMany({});
    await prisma.alerta.deleteMany({});

    await prisma.gateway.updateMany({
      data: { online: false },
    });

    console.log('🧹 [Boot Reset] Leituras e alertas zerados. Gateways marcados como offline.');
  } catch (err) {
    console.error('⚠️ [Boot Reset Error] Falha ao limpar estado inicial:', err);
  }
}

const start = async () => {
  try {
    // Limpa estado anterior antes de registrar rotas
    await limparEstadoInicial();

    // 1. Habilita CORS
    await fastify.register(cors, { origin: '*' });

    // 2. Habilita WebSocket
    await fastify.register(websocket);

    // 3. Rota de WebSocket
    fastify.register(async (fastifyInstance) => {
      fastifyInstance.get('/ws', { websocket: true }, (socket) => {
        handleWebSocketConnection(socket);
      });
    });

    // 4. Healthcheck
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date() };
    });

    // 5. Registra as rotas da API ANTES de iniciar a escuta do servidor
    await fastify.register(telemetryRoutes);
    await fastify.register(alertRoutes);
    await fastify.register(publicRoutes);

    // 6. Inicia o servidor na porta 3000
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor HTTP rodando na porta 3000');
    console.log('🔌 Canal de WebSocket ativo em ws://localhost:3000/ws');

    // 7. Conecta o consumidor MQTT
    startMQTTSubscriber();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();