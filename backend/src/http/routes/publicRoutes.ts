import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';

export async function publicRoutes(fastify: FastifyInstance) {
  // Resumo consolidado para a página institucional pública da Sinalta
  fastify.get('/api/resumo-publico', async () => {
    const totalGateways = await prisma.gateway.count();
    const gatewaysOnline = await prisma.gateway.count({
      where: { online: true },
    });
    const alertasAtivos = await prisma.alerta.count({
      where: { ativo: true },
    });

    return {
      totalGateways,
      gatewaysOnline,
      alertasAtivos,
      statusGeral: alertasAtivos > 0 ? 'ATENCAO' : 'OPERANDO_NORMAL',
      atualizadoEm: new Date(),
    };
  });
}