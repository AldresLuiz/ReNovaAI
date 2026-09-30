# Guia de Git

- **Uma branch por pessoa** (ex.: `rafael/schema`, `aldres/endpoints`, `carlos/integracao`, `bernardo/front`), saindo da `main` atualizada.
- Commits **pequenos e frequentes**, mensagem curta no imperativo ou descritiva em português.
- Integre via Pull Request para a `main`; peça revisão de quem é afetado.
- `git pull --rebase origin main` antes de abrir o PR, para reduzir conflitos.
- Nunca commitar `.env`, chaves ou credenciais.

## Mudou o contrato da API?

1. Avise no grupo **antes**.
2. Atualize [contrato-api.md](contrato-api.md) e `renovaai-front/js/mocks.js` no mesmo PR.

## Ao terminar uma tarefa

Descreva no PR o que foi feito e **o que não foi testado**.

## Marcos

- Fim do dia 1: busca e orientação ponta a ponta.
- Fim do dia 2: demo completa no celular.
