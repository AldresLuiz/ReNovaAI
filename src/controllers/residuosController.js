import { Router } from "express"
import pool from "../services/databaseService.js"

const router = Router()

const ID_MAXIMO = 2147483647   // limite do integer do Postgres

// GET /api/categorias  ->  [{ id, nome, icone }]
router.get("/api/categorias", async (req, res)=>{
    const { rows } = await pool.query("select id, nome, icone from categorias order by id")
    return res.json(rows)
})

// GET /api/residuos?q=latinha  ->  [{ id, nome, categoria, similaridade }]
// A busca (sinônimos, sem acento, erro de digitação) fica na função SQL buscar_residuos.
router.get("/api/residuos", async (req, res)=>{
    const q = String(req.query.q ?? "").trim()
    if(!q) return res.status(400).json({erro: "Digite o que você quer descartar."})
    if(q.length > 100) return res.status(400).json({erro: "O texto está muito grande."})

    // Sem resultado devolve lista vazia, não erro
    const { rows } = await pool.query("select * from buscar_residuos($1)", [q])
    return res.json(rows)
})

// GET /api/residuos/:id  ->  orientação de descarte (só resíduo ativo)
router.get("/api/residuos/:id", async (req, res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id) || id < 1 || id > ID_MAXIMO){
        return res.status(404).json({erro: "Não encontramos esse resíduo."})
    }

    const { rows } = await pool.query(
        `select r.id, r.nome, c.nome as categoria, r.risco, r.cuidados,
                r.orientacao_descarte, r.nao_fazer, r.reciclavel
         from residuos r
         join categorias c on c.id = r.categoria_id
         where r.id = $1 and r.ativo`,
        [id]
    )
    if(!rows.length) return res.status(404).json({erro: "Não encontramos esse resíduo."})

    return res.json(rows[0])
})

// Aceita só número de verdade: Number("") dá 0 e não pode virar uma coordenada
function lerCoordenada(valor, limite){
    if(typeof valor !== "string" || !valor.trim()) return null
    const n = Number(valor)
    return Number.isFinite(n) && Math.abs(n) <= limite ? n : null
}

// GET /api/residuos/:id/pontos?lat=..&lng=..  ->  { raio_usado, pontos: [...] }
// A regra de distância e de raio (10 km, 25 km, mais próximo) fica na função SQL pontos_proximos.
// A localização só é usada nesta consulta: não é guardada nem escrita em log (RNF07).
router.get("/api/residuos/:id/pontos", async (req, res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id) || id < 1 || id > ID_MAXIMO){
        return res.status(404).json({erro: "Não encontramos esse resíduo."})
    }

    const lat = lerCoordenada(req.query.lat, 90)
    const lng = lerCoordenada(req.query.lng, 180)
    if(lat === null || lng === null){
        return res.status(400).json({erro: "Não conseguimos saber onde você está. Informe seu bairro ou cidade."})
    }

    const residuo = await pool.query("select 1 from residuos where id = $1 and ativo", [id])
    if(!residuo.rows.length) return res.status(404).json({erro: "Não encontramos esse resíduo."})

    const { rows } = await pool.query("select * from pontos_proximos($1, $2, $3)", [id, lat, lng])

    // Nenhum ponto aceita esse resíduo: lista vazia, não erro
    if(!rows.length) return res.json({raio_usado: null, pontos: []})

    const pontos = rows.map(({ raio_usado, ...ponto })=> ponto)
    return res.json({raio_usado: rows[0].raio_usado, pontos})
})

export default router
