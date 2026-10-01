// Formato de erro do contrato: { "erro": "mensagem em português simples" }

export function rotaNaoEncontrada(req, res){
    return res.status(404).json({erro: "Rota não encontrada."})
}

// Express 5 já repassa erros de handlers async para cá.
// Nunca devolvemos o erro real ao usuário (sem stack trace).
export function erroMiddleware(err, req, res, next){
    console.error(err)
    return res.status(500).json({erro: "Algo deu errado. Tente de novo em instantes."})
}
