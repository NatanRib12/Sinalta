# Relatório Técnico
##  1. Como Rodar o Sistema

### Pré-requisitos

cd backend

npm install fastify @fastify/cors @fastify/websocket @prisma/client dotenv mqtt resend

npm install -D typescript tsx prisma @types/node

---

cd frontend

npm install react react-dom react-router-dom axios lucide-react

npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss postcss autoprefixer

### Passo a Passo

```

desafio-ingestao/backend > npm run dev
desafio-ingestao/frontend > npm run dev
desafio-ingestao > npm run planta:dia

```

O dashboard estará acessível em `http://localhost:5173` e a API em `http://localhost:3000`.

##  2. Desenho da Arquitetura

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Planta Industrial                             │
│   [Sensores de Temp/Vib] ──► [Gateways KG-100 / KG-200]               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Broker MQTT (kerno/#)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             Backend Node.js                            │
│  ┌───────────────────────┐    ┌─────────────────────────────────────┐  │
│  │    MQTT Subscriber    │ ──►│   Normalizer & Offset kWh Engine    │  │
│  └───────────────────────┘    └──────────────────┬──────────────────┘  │
│                                                  │                     │
│  ┌───────────────────────┐    ┌──────────────────▼──────────────────┐  │
│  │   Resend Email API    │◄───│  Rules Engine & Predictive Engine   │  │
│  └───────────────────────┘    └──────────────────┬──────────────────┘  │
│                                                  │                     │
│  ┌───────────────────────┐    ┌──────────────────▼──────────────────┐  │
│  │   Prisma / Postgres   │◄───│    WebSocket Broadcast (wsHandler)  │  │
│  └───────────────────────┘    └──────────────────┬──────────────────┘  │
└──────────────────────────────────────────────────┼─────────────────────┘
                                                   │ WS (ws://.../ws)
                                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                        │
│   [Planta 2D Interativa]  │  [Canais de Telemetria]  │  [Sidebar Logs] │
└────────────────────────────────────────────────────────────────────────┘

```

### Fluxo de Dados:

1. Ingestão: Os gateways transmitem tópicos MQTT.

2. Normalização: O módulo `normalizer.ts` normaliza os dados vindos do KG-100 e KG-200.

3. Regras: O `rulesEngine.ts` valida limites críticos e gerencia entrada de alertas.

4. Predição: O `predictiveEngine.ts` analisa a variação ($d/dt$) das últimas leituras para calcular a taxa de elevação e estimar o tempo restante até a falha.

5. Notificação: Disparo imediato de e-mails via API do Resend.

## 3. Stacks e Justificativas

React + Vite: Alta performance na renderização de dados em tempo real, estrutura modular de componentes e suporte nativo a TypeScript.

Tailwind: Desenvolvimento ágil de estilização de interface.

Fastify: Escolhido pelo alto *throughput* de requisições por segundo e suporte a WebSockets.

Prisma ORM + PostgreSQL: Tecnologia que já estrutura as tabelas dentro do banco de dados. E banco de dados projetado para receber diversas informações em pequenas frações de tempo.

MQTT (Mosquitto): Padrão da indústria IIoT pelo baixo *overhead* de rede, suporte a QoS 1. 

Resend API: Envio de emails para enviar alertar para o usuário. 

## 4. Descobertas sobre os Gateways

1. Diferenças:
   * KG-100 (Cálculo Monocanal): 
   - Uma mensagem por canal para cada ciclo
   - Possui 4 canais de transmissão
   - Dados transmitidos precisam ser convertidos 

   * KG-200 (Multicanal / Batch):
   - Uma mensagem por ciclo para todos os canais
   - Possui 8 canais de transmissão
   - Dados transmitidos já vem em unidade de engenharia 

## 5. Comparação com o Relato do Dia 10/09

Compando com o relato, as informações sobre o funcionamento das câmaras e dos compressores permitiu testar e verificar os fatos reportados por meio do funcionamento dos sensores. Assim, cada erro que ocorria, o sistema reportava no próprio dashboard.

## 6. O que Ficou de Fora / Próximos Passos

O que ficou de fora foi a informação da envasadora. Como o problema do cliente era monitorar sua mercadoria utilizando os sensores, então a informação da operação da envasadora tem pouco relevância para a solução desenvolvida.
