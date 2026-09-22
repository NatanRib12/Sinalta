import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ultimosDisparos: Record<string, number> = {};
const COOLDOWN_MS = 15 * 60 * 1000;

// Lista estrita dos únicos canais autorizados a disparar e-mail
const dataFields = [
  'CF-01-TMP',
  'CF-02-TMP',
  'CMP-01-VIB',
  'CMP-02-VIB',
  'MED-GER-KWH',
];

export interface NotificacaoEmailParams {
  tipoEvento: 'INSTANTANEO' | 'PREDITIVO';
  tag: string;
  titulo: string;
  detalheOuDiagnostico: string;
  acaoRecomendada: string;
  valorAtual?: number | string | null;
  unidade?: string;
  estimativaMinutos?: number | null;
}

export async function enviarEmailNotificacao(data: NotificacaoEmailParams) {
  const tagLimpa = data.tag?.toUpperCase()?.trim();

  // 1. Descarta qualquer sensor fora da lista estrita de ativos essenciais
  if (!dataFields.includes(tagLimpa)) {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === '' || apiKey.startsWith('re_123456789')) {
    console.warn('[Resend] RESEND_API_KEY não foi configurada no .env.');
    return;
  }

  const chaveCooldown = `${data.tipoEvento}_${tagLimpa}`;
  const agora = Date.now();
  const ultimoEnvio = ultimosDisparos[chaveCooldown] || 0;

  if (agora - ultimoEnvio < COOLDOWN_MS) {
    return;
  }

  const destinatario = process.env.EMAIL_NOTIFICATION_TO || 'natansantosribeiro241@gmail.com';
  const remetente = process.env.EMAIL_FROM || 'Sinalta Alertas <onboarding@resend.dev>';

  const ehPreditivo = data.tipoEvento === 'PREDITIVO';
  const corDestaque = ehPreditivo ? '#FF9F2E' : '#FF5B2E';
  const assunto = `${ehPreditivo ? '[Previsão de Falha]' : '[Alerta Crítico]'} - ${tagLimpa}`;

  // Valida se o valor existe e é válido (ignora textos de erro/indisponível)
  const possuiValorValido =
    data.valorAtual !== undefined &&
    data.valorAtual !== null &&
    data.valorAtual !== 'ERR / INDISPONÍVEL';

  try {
    const resposta = await resend.emails.send({
      from: remetente,
      to: [destinatario],
      subject: assunto,
      html: `
        <div style="font-family: Arial, sans-serif; color: #14171C; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          
          <!-- Topo -->
          <div style="background-color: #14171C; color: #ffffff; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;"> Sinalta · Central de Alertas</h2>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #8C9096;">Laticínio Vale do Cedro · Monitoramento Industrial</p>
          </div>
          
          <!-- Corpo -->
          <div style="padding: 24px;">
            <div style="background-color: ${corDestaque}15; border-left: 4px solid ${corDestaque}; padding: 12px 16px; margin-bottom: 20px; border-radius: 6px;">
              <strong style="color: ${corDestaque}; font-size: 13px; text-transform: uppercase;">
                ${ehPreditivo ? 'ANÁLISE PREDITIVA DE TENDÊNCIA' : 'OCORRÊNCIA EM TEMPO REAL'}
              </strong>
            </div>

            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #14171C;">${data.titulo}</h3>
            
            <!-- Exibe SOMENTE a Tag no campo de equipamento -->
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #8C9096;">
              Equipamento: <strong>${tagLimpa}</strong>
            </p>

            ${
              possuiValorValido || data.estimativaMinutos
                ? `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #F5F2EC; border-radius: 10px;">
              ${
                possuiValorValido
                  ? `
              <tr style="border-bottom: 1px solid #e5e0d8;">
                <td style="padding: 12px 16px; color: #8C9096; font-size: 13px;">Valor Registrado:</td>
                <td style="padding: 12px 16px; font-weight: bold; font-size: 14px; text-align: right; color: #14171C;">
                  ${data.valorAtual} ${data.unidade || ''}
                </td>
              </tr>`
                  : ''
              }
              ${
                data.estimativaMinutos
                  ? `
              <tr>
                <td style="padding: 12px 16px; color: #8C9096; font-size: 13px;">Estimativa até Falha:</td>
                <td style="padding: 12px 16px; font-weight: bold; font-size: 14px; text-align: right; color: #FF5B2E;">
                  ~${data.estimativaMinutos} minutos
                </td>
              </tr>`
                  : ''
              }
            </table>`
                : ''
            }

            <!-- Descrição da Ocorrência -->
            <div style="background-color: #ffffff; border: 1px solid #14171C15; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 6px 0; font-size: 11px; color: #8C9096; text-transform: uppercase;">
                ${ehPreditivo ? 'Diagnóstico Preditivo' : 'Descrição da Ocorrência'}:
              </h4>
              <p style="margin: 0; font-size: 13px; color: #14171C; font-weight: 600; line-height: 1.5;">
                ${data.detalheOuDiagnostico}
              </p>
            </div>

            <!-- Ação Recomendada -->
            <div style="background-color: #1F6F5C15; border-left: 4px solid #1F6F5C; padding: 14px 16px; border-radius: 6px;">
              <h4 style="margin: 0 0 4px 0; font-size: 11px; color: #1F6F5C; text-transform: uppercase;">
                🔧 Ação Recomendada para a Equipe de Campo:
              </h4>
              <p style="margin: 0; font-size: 13px; color: #14171C; font-weight: 600;">
                ${data.acaoRecomendada}
              </p>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="background-color: #F5F2EC; padding: 14px; text-align: center; font-size: 11px; color: #8C9096;">
            Mensagem automática enviada pela Plataforma Sinalta.
          </div>
        </div>
      `,
        });

        if (resposta.error) {
          console.error(`[Resend Error] Falha ao enviar e-mail:`, resposta.error);
        } else {
          ultimosDisparos[chaveCooldown] = agora;
          console.log(`[Resend Success] E-mail enviado para ${destinatario} [Tag: ${tagLimpa}]`);
        }
      } catch (error) {
        console.error('[Resend Exception] Erro na API:', error);
      }
    }