# Sinalta, parte 3 do desafio

Na parte 1 você consertou um app. Na parte 2 você construiu um agente em cima de uma tela e de uma
base que já existiam. Aqui não existe nada: nem tela, nem backend, nem banco. Existe a fonte dos
dados, o manual dela e um cliente esperando.

---

## O cenário

A **Sinalta** é uma startup de monitoramento de máquinas. Ela coloca sensores nos equipamentos do
cliente, os dados chegam num painel e o cliente fica sabendo do problema antes da máquina parar.

Você acabou de entrar. O primeiro cliente fechou: o **Laticínio Vale do Cedro**, que já tem quatro
gateways Kerno instalados na planta. Eles entram em operação na segunda-feira.

A Marina, sócia da Sinalta, te mandou isto:

> Oi! Seja muito bem-vindo. Vou direto porque a semana tá corrida.
>
> A gente precisa de duas coisas pra ontem.
>
> **O site da Sinalta.** Hoje a gente não tem nada e eu tô mandando proposta com link de Instagram,
> uma vergonha. Precisa explicar o que a gente faz, mostrar os planos e ter um jeito do cliente falar
> com a gente. Seria incrível se desse pra mostrar alguma coisa ao vivo da planta do Vale do Cedro,
> pro visitante ver que é de verdade. O logo e as cores tão na pasta `marca`, quem fez foi meu primo.
>
> **O sistema.** Os gateways mandam tudo por MQTT e o manual do fabricante tá na pasta `docs`. O
> pessoal do laticínio precisa ver as máquinas ao vivo, ver o que aconteceu no dia e ficar sabendo
> quando alguma coisa sai do normal. O Seu Geraldo, que cuida da manutenção lá, falou duas coisas que
> importam muito pra ele: câmara de resfriados acima de 7 graus por mais de 15 minutos é produto
> jogado fora, e compressor de amônia vibrando demais é o que mais dá prejuízo. O Seu Otávio, dono do
> laticínio, vai querer olhar pelo celular. E óbvio, os dados deles são deles.
>
> Os planos por enquanto são esses, pode mexer no texto:
>
> - **Essencial**: R$ 390 por máquina por mês. Monitoramento e alertas.
> - **Completo**: R$ 690 por máquina por mês. Tudo do Essencial, mais relatório mensal e uma visita
>   técnica por trimestre.
> - **Planta inteira**: sob consulta.
>
> WhatsApp comercial: (31) 90000-0000. E-mail ainda não temos.
>
> Qualquer coisa me chama!

## O que você recebe

```
planta/    a planta do Vale do Cedro, simulada: um broker MQTT com os quatro gateways
docs/      Manual-Kerno-KG.pdf, o manual de integração do fabricante dos gateways
marca/     logo e cores da Sinalta
```

A planta é uma caixa-preta de propósito, como um equipamento de verdade: você não tem o firmware do
gateway, só o manual. **Tudo o que os gateways fazem está descrito no manual.**

## Como rodar a planta

Precisa de Node 20 ou mais novo. A planta não precisa de `npm install`.

```bash
npm run planta
```

Sobe um broker MQTT em `localhost:1883` com os quatro gateways publicando no relógio de agora. O
usuário e a senha aparecem no terminal. Deixe rodando enquanto você trabalha.

```bash
npm run planta:dia
```

Reproduz o **dia de teste, 10/09/2026**, quando os gateways ficaram ligados pela primeira vez. O dia
foi gravado do começo ao fim e toca 60 vezes mais rápido: as 24 horas passam em 24 minutos. A
reprodução só começa quando algum cliente assina um tópico no broker. Para ir mais rápido:
`npm run planta:dia -- --velocidade 600`.

As duas usam a mesma porta, então rode uma de cada vez.

---

## O dia de teste

O Seu Geraldo anotou o que aconteceu no dia 10/09 e mandou para a Marina:

> Bom dia. Segue o que teve no dia do teste.
>
> - Madrugada tranquila. O degelo da câmara 1 é automático, roda às 2h e às 14h.
> - Umas 6h10 caiu a energia da câmara, voltou em 2 minutos.
> - A porta da câmara 1 ficou encostada das 7h40 até 8h05. Foi o Zé que viu.
> - Às 10h o eletricista mexeu no cabo do sensor da câmara 2, levou uns 20 minutos.
> - Depois do almoço, 14h10, a internet do galpão de utilidades caiu. Voltou 14h50.
> - O compressor 2 começou a fazer um barulho diferente de tarde. Já chamei o técnico.
> - 19h30 desligaram o gateway de utilidades pra trocar de tomada, coisa de um minuto.
> - A envasadora roda das 6h às 22h, depois para.
> - Pela conta da concessionária, a planta consumiu 3.467 kWh no dia.

**O seu sistema precisa contar a mesma história.** Rode o dia, veja o que o seu sistema mostra e
compare com o relato. Onde bater, ótimo. Onde não bater, descubra por quê: ou o seu sistema está
errado, ou existe uma razão boa para a diferença, e aí você explica qual é.

---

## O que entregar

- O repositório com o site e o sistema, e um jeito simples de rodar tudo.
- Um `RELATORIO.md` com: como você desenhou a solução e por quê, a stack que escolheu e por quê, o que
  descobriu sobre os gateways, a comparação entre o seu sistema e o relato do dia 10/09, e o que
  ficou de fora.
- Um vídeo curto mostrando o site e o sistema funcionando, com a planta rodando.

## Combinados

- **A stack é sua.** Linguagem, framework, banco: escolha e justifique no relatório. Escolher também é
  parte do trabalho.
- Pode pesquisar e usar IA à vontade. Só não traga código que você não sabe explicar, porque na semana
  que vem é você que vai mexer nele.
- Não precisa subir nada na nuvem. Rodando na sua máquina está ótimo.
- Uns 3 a 4 dias de trabalho, sem virar noite.
- Travou mais de uma hora no mesmo ponto? Me chama.

## Desta vez, nenhuma dica

Nas outras partes teve dica. Aqui não tem, e é de propósito. A Marina não sabe o que é MQTT, e o Seu
Geraldo não sabe o que é um banco de dados. Eles dizem o que precisam do jeito deles, e o resto quem
descobre é você, no manual, nos dados e no relato.

**O que ninguém pediu, mas o sistema precisa ter para ser usado de verdade, também é trabalho seu.**
