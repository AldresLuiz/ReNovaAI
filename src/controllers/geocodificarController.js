import { Router } from "express"

const router = Router()

// GET /api/geocodificar?q=bairro  ->  { lat, lng }
// Proxy para o Nominatim (OpenStreetMap). Não guarda nada do usuário (RNF07).
router.get("/api/geocodificar", async (req, res)=>{
    const q = String(req.query.q ?? "").trim()
    if(!q) return res.status(400).json({erro: "Digite um bairro ou cidade."})
    if(q.length > 100) return res.status(400).json({erro: "O texto está muito grande."})

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

    return res.json({lat: Number(dados[0].lat), lng: Number(dados[0].lon)})
})

export default router
