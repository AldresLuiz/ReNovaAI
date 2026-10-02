import { Router } from "express";
import { classifyWasteImage } from "../services/wasteClassificationService.js";
import multer from "multer";

const router = Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Formato de imagem inválido."));
        }

        cb(null, true);
    }
});

router.post(
    "/api/identificar-foto",
    upload.single("image"),
    async (req, res)=>{
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Nenhuma imagem enviada."
                });
            }

            const result = await classifyWasteImage(
                req.file.buffer,
                req.file.mimetype
            );

            return res.status(200).json({
                message: "Resíduo identificado com sucesso.",
                data: result
            });

        } catch (error) {
            console.error("[WASTE_CLASSIFICATION]", error);

            return res.status(500).json({
                message: "Erro ao classificar resíduo."
            });
        }
    }
);

export default router