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

## Aprendizados (problemas que já resolvemos)

- **Migration aplicada não se edita.** Se mudar algo já aplicado no Supabase, crie um arquivo novo com número maior. Se o arquivo ainda não foi aplicado, pode ser editado.
- **Confira na `main`, não só na branch.** Itens marcados como prontos no Trello ficaram sem estar na `main` (por exemplo, o CORS). Antes de marcar, rode `git fetch` e olhe a `main`.
- **Não faça `git merge main` por engano** numa branch de outra pessoa. Para atualizar a sua, use `git pull --rebase origin main`.
- Depois do merge de um PR, volte para a `main` (`git checkout main && git pull --ff-only origin main`) antes de abrir a próxima branch.
- Commit de documentação e de código em PRs separados facilita a revisão.
