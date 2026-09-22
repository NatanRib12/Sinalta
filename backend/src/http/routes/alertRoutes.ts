import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';

export async function alertRoutes(fastify: FastifyInstance) {
  fastify.get('/api/alertas', async () => {
    // 1. Busca os alertas atualmente marcados como ativos no banco para auto-reconciliação
    const alertasAtivosNoBanco = await prisma.alerta.findMany({
      where: { ativo: true },
      orderBy: { inicio: 'desc' },
    });

    // 2. Auto-reconciliação: verifica se a última leitura salva justifica o alerta aberto
    for (const alerta of alertasAtivosNoBanco) {
      const ultimaLeitura = await prisma.leitura.findFirst({
        where: { gatewayId: alerta.gatewayId, canal: alerta.canal },
        orderBy: { timestamp: 'desc' },
      });

      const config = await prisma.gatewayConfig.findUnique({
        where: { gatewayId_canal: { gatewayId: alerta.gatewayId, canal: alerta.canal } },
      });

      const limite = config?.alarmeAlto ?? (alerta.tipo === 'TEMPERATURA_ELEVADA' ? 7.0 : 7.1);

      // Se a leitura atual já se normalizou, encerra o alerta no banco
      if (
        ultimaLeitura &&
        ultimaLeitura.valor !== null &&
        !ultimaLeitura.erro &&
        ultimaLeitura.valor <= limite
      ) {
        await prisma.alerta.update({
          where: { id: alerta.id },
          data: { ativo: false, fim: ultimaLeitura.timestamp },
        });
      }
    }

    // 3. Retorna o registro acumulado dos últimos 100 alertas (ativos + normalizados para o painel e sidebar)
    return prisma.alerta.findMany({
      orderBy: { inicio: 'desc' },
      take: 100,
    });
  });
}