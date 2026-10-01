// CORS feito à mão (o pacote "cors" não está no package.json).
// Libera só o front: FRONT_URL (produção) e localhost:8000 (desenvolvimento).
const origensPermitidas = [
    process.env.FRONT_URL?.replace(/\/$/, ""),
    "http://localhost:8000",
    "http://127.0.0.1:8000"
].filter(Boolean)

export function corsMiddleware(req, res, next){
    const origem = req.headers.origin
    if(origem && origensPermitidas.includes(origem)){
        res.setHeader("Access-Control-Allow-Origin", origem)
        res.setHeader("Vary", "Origin")
    }

    // O navegador faz um "pré-voo" OPTIONS antes de algumas requisições
    if(req.method === "OPTIONS"){
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")
        return res.sendStatus(204)
    }
    next()
}
