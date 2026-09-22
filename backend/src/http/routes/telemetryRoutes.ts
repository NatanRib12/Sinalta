import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { analisarPrevisaoEEnviarNotificacao } from '../../services/predictiveEngine';

export async function telemetryRoutes(fastify: FastifyInstance) {
  // 1. Lista todos os gateways e suas configurações de canais
  fastify.get('/api/gateways', async () => {
    return prisma.gateway.findMany({
      include: {
        configs: true,
      },
    });
  });

  fastify.get('/api/previsoes', async () => {
      return analisarPrevisaoEEnviarNotificacao();
    });

  // 2. Retorna a última leitura apenas se o gateway estiver ONLINE
  fastify.get('/api/leituras/recentes', async () => {
    const configs = await prisma.gatewayConfig.findMany({
      include: { gateway: true },
    });

    return Promise.all(
      configs.map(async (cfg) => {
        // Se o gateway estiver offline, não retorna leitura armazenada do passado
        if (!cfg.gateway.online) {
          return {
            gatewayId: cfg.gatewayId,
            canal: cfg.canal,
            tag: cfg.tag,
            descricao: cfg.descricao,
            grandeza: cfg.grandeza,
            unidade: cfg.unidade,
            tipo: cfg.tipo,
            alarmeAlto: cfg.alarmeAlto,
            online: false,
            leitura: null,
          };
        }

        const ultima = await prisma.leitura.findFirst({
          where: { gatewayId: cfg.gatewayId, canal: cfg.canal },
          orderBy: { timestamp: 'desc' },
        });

        return {
          gatewayId: cfg.gatewayId,
          canal: cfg.canal,
          tag: cfg.tag,
          descricao: cfg.descricao,
          grandeza: cfg.grandeza,
          unidade: cfg.unidade,
          tipo: cfg.tipo,
          alarmeAlto: cfg.alarmeAlto,
          online: cfg.gateway.online,
          leitura: ultima,
        };
      })
    );
  });

  // 3. Histórico de leituras para os gráficos no Dashboard
  fastify.get('/api/leituras/historico', async (request) => {
    const { gatewayId, canal, limit } = request.query as {
      gatewayId?: string;
      canal?: string;
      limit?: string;
    };

    const whereClause: Record<string, any> = {};
    if (gatewayId) whereClause.gatewayId = gatewayId;
    if (canal) whereClause.canal = parseInt(canal, 10);

    return prisma.leitura.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' },
      take: limit ? parseInt(limit, 10) : 500,
    });
  });
}