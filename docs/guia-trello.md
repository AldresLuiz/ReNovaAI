# Guia do Trello

Quadro: https://trello.com/b/wgU7lkEn/renovaai-hackathon

**Regra de ouro:** o repositório é a fonte de verdade do escopo, do contrato da API e das regras de negócio ([AGENTS.md](../AGENTS.md), [contrato-api.md](contrato-api.md)). O Trello só acompanha o andamento. Se os dois divergirem, vale o repositório, e o Trello é corrigido.

## Listas

| Lista | Uso |
| --- | --- |
| TEMPLATE | Modelo de card (🎯 Objetivo, 🧠 Contexto, ✅ Entrega, ✔️ Critérios, 📝 Observações). Copie para criar tarefas novas |
| 🔄 Ritual do Time | Cards fixos: leia primeiro, time, fluxo do MVP e o check-in diário |
| Entrada / Ideias (fora do MVP) | Ideias e evoluções. Não entram no prazo |
| A Fazer | Tarefas do MVP, em ordem de prazo |
| Em Desenvolvimento | Quem pegou a tarefa move para cá |
| Bloqueado | Tarefa já começada que travou por motivo externo (acesso, dado, serviço fora do ar). Escreva o motivo e marque quem pode destravar |
| Em Revisão / Testes | Pronta, esperando revisão ou teste |
| Ajustes | Voltou da revisão com correções |
| Concluído | Aprovada |
| Entregue | Incluída na versão entregue |

## Etiquetas

- **Pessoa:** Rafael, Aldres, Carlos, Bernardo, Todos.
- **Área:** 🔵 Front-end, ⚫ Back-end, 🟣 Banco de dados.
- **Prioridade:** 🔴 Urgente, 🟠 Alta, 🟡 Média, 🟢 Baixa.
- **Status:** 🔓 Livre (pode começar) e 🔒 Bloqueado (depende de outro card).
- **🔥 Caminho crítico:** se atrasar, bloqueia o marco do dia.

O responsável e a área também aparecem no título: `[Rafael · Banco] ...`.

## Como trabalhar

1. Pegue um card 🔓 Livre da sua pessoa e mova para **Em Desenvolvimento**.
2. Faça a tarefa e marque os itens do checklist **✔️ Critérios de aprovação** conforme avança.
3. Ao terminar, mova para **Em Revisão / Testes** e diga no card o que foi feito e o que **não** foi testado.
4. Ao concluir, leia **➡️ Ao concluir, desbloqueia** no fim da descrição e troque 🔒 Bloqueado por 🔓 Livre nos cards liberados.
5. Se travar, comente no card com @menção de quem pode ajudar. Se o motivo for externo, mova para **Bloqueado**.

Cada card de tarefa traz o link do repositório, os pré-requisitos (com link para os outros cards) e a referência do guia em `docs/` que ajuda a fazê-lo.

## Check-in diário

O card **🗓️ Check-in de alinhamento** é fixo. No fim de cada dia, comente com a data e um resumo curto: o que saiu, o que travou e o que vem a seguir. Antes de puxar o próximo card, leia os comentários novos.

Mudança no contrato da API: avise aqui **antes** de entrar e atualize [contrato-api.md](contrato-api.md) e `renovaai-front/js/mocks.js` no mesmo PR.

## Marcos

- **Dia 1:** busca e orientação funcionando ponta a ponta. Sem isso, o mapa não começa.
- **Dia 2:** demo completa no celular.

Prazo de entrega: sexta, 02/10/2026.
