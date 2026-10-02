import { Router } from "express";
import { classifyWasteImage } from "../services/wasteClassificationService.js";
import multer from "multer";
import pool from "../services/databaseService.js";

const router = Router()

const TAMANHO_MAXIMO = 5 * 1024 * 1024

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: TAMANHO_MAXIMO
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(Object.assign(new Error("Formato de imagem inválido."), { formatoInvalido: true }));
        }

        cb(null, true);
    }
});

// Erros de envio da imagem (formato, tamanho) são erro de pedido: 400/413 no formato { erro }.
// Qualquer outro erro segue para o erroMiddleware (500 genérico).
function receberImagem(req, res, next) {
    upload.single("image")(req, res, (erro)=>{
        if (!erro) return next()

        if (erro.formatoInvalido) {
            return res.status(400).json({
                erro: "Envie uma foto em JPG, PNG ou WebP."
            })
        }
        if (erro instanceof multer.MulterError && erro.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                erro: "A foto é grande demais. Envie uma de até 5 MB."
            })
        }
        if (erro instanceof multer.MulterError) {
            return res.status(400).json({
                erro: "Não conseguimos ler a foto. Tente enviar de novo."
            })
        }
        return next(erro)
    })
}

// POST /api/identificar-foto  (fase 2, opcional)
// A IA só classifica; a orientação de descarte vem sempre do banco.
router.post(
    "/api/identificar-foto",
    receberImagem,
    async (req, res)=>{
        try {
            if (!req.file) {
                return res.status(400).json({
                    erro: "Envie uma foto do resíduo."
                });
            }

            const { type } = await classifyWasteImage(
                req.file.buffer,
                req.file.mimetype
            );

            // A IA só diz a categoria. A orientação de descarte vem sempre do banco:
            // devolvemos os resíduos ativos dessa categoria (ids que o front abre em residuo.html).
            // O nome é comparado sem acento nem caixa, e com tolerância a pequenas diferenças
            // ("plastico" x "Plásticos"). Sem categoria reconhecida: lista vazia, e o front cai
            // para a busca por texto.
            const { rows } = await pool.query(
                `with alvo as (select lower(extensions.unaccent($1::text)) as nome),
                      escolhida as (
                          select c.id, c.nome
                          from categorias c, alvo
                          where lower(extensions.unaccent(c.nome)) = alvo.nome
                             or extensions.similarity(lower(extensions.unaccent(c.nome)), alvo.nome) >= 0.5
                          order by (lower(extensions.unaccent(c.nome)) = alvo.nome) desc,
                                   extensions.similarity(lower(extensions.unaccent(c.nome)), alvo.nome) desc
                          limit 1
                      )
                 select e.nome as categoria, r.id, r.nome
                 from escolhida e
                 join residuos r on r.categoria_id = e.id and r.ativo
                 order by r.id`,
                [String(type ?? "").trim()]
            );

            return res.status(200).json({
                categoria: rows[0]?.categoria ?? null,
                residuos: rows.map(({ id, nome }) => ({ id, nome }))
            });

        } catch (error) {
            console.error("[WASTE_CLASSIFICATION]", error);

            return res.status(500).json({
                erro: "Não conseguimos identificar o resíduo agora. Tente de novo em instantes."
            });
        }
    }
);

export default router
