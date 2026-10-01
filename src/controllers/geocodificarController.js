import { Router } from "express"

const router = Router()

// Política do Nominatim: no máximo 1 requisição por segundo. Por isso:
// - buscas repetidas ficam em memória por 10 min (só o nome do lugar digitado);
// - as chamadas ao Nominatim saem espaçadas em 1,1 s uma da outra;
// - se a fila passar de 5 s, respondemos 429 em vez de segurar o usuário.
const INTERVALO_MS = 1100
const ESPERA_MAXIMA_MS = 5000
const CACHE_MS = 10 * 60 * 1000
const CACHE_MAX = 200
const cache = new Map()
let proximaChamada = 0

// Devolve quanto esperar (ms) antes de chamar o Nominatim, ou null se a fila está cheia
function reservarVez(){
    const agora = Date.now()
    const inicio = Math.max(agora, proximaChamada)
    const espera = inicio - agora
    if(espera > ESPERA_MAXIMA_MS) return null
    proximaChamada = inicio + INTERVALO_MS
    return espera
}

// GET /api/geocodificar?q=bairro  ->  { lat, lng }
// Proxy para o Nominatim (OpenStreetMap). Não guarda nada do usuário (RNF07).
router.get("/api/geocodificar", async (req, res)=>{
    const q = String(req.query.q ?? "").trim()
    if(!q) return res.status(400).json({erro: "Digite um bairro ou cidade."})
    if(q.length > 100) return res.status(400).json({erro: "O texto está muito grande."})

    const chave = q.toLowerCase()
    const guardado = cache.get(chave)
    if(guardado && guardado.expira > Date.now()) return res.json(guardado.valor)

    const espera = reservarVez()
    if(espera === null) return res.status(429).json({erro: "Muitas buscas ao mesmo tempo. Tente de novo em instantes."})
    if(espera > 0) await new Promise((resolve) => setTimeout(resolve, espera))

    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=" + encodeURIComponent(q)

    let dados
    try{
        const resposta = await fetch(url, {
            // A política do Nominatim exige User-Agent identificado
            headers: {"User-Agent": "ReNovaAI-Hackathon-Unifavip"},
            signal: AbortSignal.timeout(5000)
        })
        if(!resposta.ok) throw new Error("Nominatim respondeu " + resposta.status)
        dados = await resposta.json()
    } catch (e) {
        console.error(e)
        // 502: o front deve cair no modo sem mapa (RNF08)
        return res.status(502).json({erro: "Não conseguimos buscar o local agora. Tente de novo em instantes."})
    }

    if(!dados.length) return res.status(404).json({erro: "Não encontramos esse local. Tente o bairro e a cidade."})

    const valor = {lat: Number(dados[0].lat), lng: Number(dados[0].lon)}
    if(cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value)
    cache.set(chave, {valor, expira: Date.now() + CACHE_MS})
    return res.json(valor)
})

export default router
