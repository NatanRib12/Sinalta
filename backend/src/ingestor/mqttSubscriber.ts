import mqtt from 'mqtt';
import { prisma } from '../config/database';
import { parseKG100, parseKG200, LeituraNormalizada } from './normalizer';
import { processarAlertas } from '../services/rulesEngine';
import { transmitirMensagem } from '../http/websocket/wsHandler';

export function startMQTTSubscriber() {
  const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'sinalta_backend_ingestor',
    username: 'valedocedro',
    password: 'kerno-2026',
    clean: false,
  });

  client.on('connect', () => {
    console.log('✅ Conectado ao Broker MQTT da Planta');
    client.subscribe('kerno/#', { qos: 1 });
  });

  client.on('message', async (topic, message) => {
    try {
      const parts = topic.split('/');
      if (parts.length < 3) return;

      const serial = parts[1];
      const tipoTopico = parts[2];
      const payload = JSON.parse(message.toString());

      if (tipoTopico === 'estado') {
        const gatewayAtualizado = await prisma.gateway.upsert({
          where: { serial },
          update: {
            online: payload.online,
            firmware: payload.firmware || '1.0',
          },
          create: {
            serial,
            modelo: serial.startsWith('KG2') ? 'KG-200' : 'KG-100',
            firmware: payload.firmware || '1.0',
            online: payload.online,
          },
        });

        transmitirMensagem('ESTADO', gatewayAtualizado);
      }

      if (tipoTopico === 'config') {
        const isKG200 = serial.startsWith('KG2');
        const canais = isKG200 ? payload.canais : payload.ch;
        const intervaloSec = isKG200 ? payload.intervalo_s : payload.int;

        await prisma.gateway.update({
          where: { serial },
          data: { intervaloSec: intervaloSec || 10 },
        });

        for (const c of canais) {
          const canalNum = isKG200 ? c.canal : c.id;
          await prisma.gatewayConfig.upsert({
            where: { gatewayId_canal: { gatewayId: serial, canal: canalNum } },
            update: {
              tag: c.tag,
              descricao: isKG200 ? c.descricao : c.desc,
              grandeza: c.grandeza || null,
              unidade: isKG200 ? c.unidade : c.un,
              tipo: c.tipo || 'instantaneo',
              alarmeAlto: c.alarme_alto || null,
              esc: c.esc || 1.0,
              sig: c.sig || 0,
            },
            create: {
              gatewayId: serial,
              canal: canalNum,
              tag: c.tag,
              descricao: isKG200 ? c.descricao : c.desc,
              grandeza: c.grandeza || null,
              unidade: isKG200 ? c.unidade : c.un,
              tipo: c.tipo || 'instantaneo',
              alarmeAlto: c.alarme_alto || null,
              esc: c.esc || 1.0,
              sig: c.sig || 0,
            },
          });
        }
      }

      if (tipoTopico === 'dados') {
        let leituras: LeituraNormalizada[] = [];

        if (serial.startsWith('KG2')) {
          leituras = parseKG200(serial, payload);
        } else {
          const config = await prisma.gatewayConfig.findUnique({
            where: { gatewayId_canal: { gatewayId: serial, canal: payload.c } },
          });
          leituras = [parseKG100(serial, payload, config || undefined)];
        }

        for (const l of leituras) {
          const leituraSalva = await prisma.leitura.upsert({
            where: {
              gatewayId_canal_seq_timestamp: {
                gatewayId: l.gatewayId,
                canal: l.canal,
                seq: l.seq,
                timestamp: l.timestamp,
              },
            },
            update: {},
            create: {
              gatewayId: l.gatewayId,
              canal: l.canal,
              seq: l.seq,
              timestamp: l.timestamp,
              valor: l.valor,
              erro: l.erro,
            },
          });

          transmitirMensagem('LEITURA', leituraSalva);

          // Passa o 5º argumento 'l.erro' para detectar se o sensor caiu
          await processarAlertas(l.gatewayId, l.canal, l.valor, l.timestamp, l.erro);
        }
      }
    } catch (err) {
      console.error('Erro ao processar mensagem MQTT:', err);
    }
  });
}