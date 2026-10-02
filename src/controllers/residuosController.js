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

export default router
