export interface LeituraNormalizada {
  gatewayId: string;
  canal: number;
  seq: number;
  timestamp: Date;
  valor: number | null;
  erro: string | null;
}

// Trata a payload do KG-100 (mensagens individuais por canal com inteiros de 16 bits)
export function parseKG100(
  sn: string,
  payload: { n: number; c: number; t: number; v: number },
  configCanal?: { esc: number; sig: number }
): LeituraNormalizada {
  const { n, c, t, v } = payload;
  let valor: number | null = null;
  let erro: string | null = null;

  // Trata erros de hardware segundo a seção 7.2 do manual
  if (v === 65535) {
    erro = "SENSOR_DESCONECTADO";
  } else if (v === 65534) {
    erro = "FORA_DA_FAIXA";
  } else {
    let valorBruto = v;
    const sig = configCanal?.sig ?? 0;
    const esc = configCanal?.esc ?? 1;

    // Converte complemento de dois para valores com sinal
    if (sig === 1 && v >= 32768) {
      valorBruto = v - 65536;
    }
    valor = valorBruto * esc;
  }

  // Trata timestamp em segundos (FW < 1.9) ou milissegundos (FW >= 1.9)
  const timestampMs = t < 10000000000 ? t * 1000 : t;

  return {
    gatewayId: sn,
    canal: c,
    seq: n,
    timestamp: new Date(timestampMs),
    valor,
    erro,
  };
}

// Trata a payload do KG-200 (mensagens em lote por ciclo com unidades prontas)
export function parseKG200(
  serial: string,
  payload: {
    seq: number;
    ts: number;
    leituras: Array<{ canal: number; valor: number | null; erro?: string }>;
  }
): LeituraNormalizada[] {
  return payload.leituras.map((item) => ({
    gatewayId: serial,
    canal: item.canal,
    seq: payload.seq,
    timestamp: new Date(payload.ts),
    valor: item.valor,
    erro: item.erro || null,
  }));
}