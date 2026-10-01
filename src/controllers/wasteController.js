import { Router } from "express";
import { classifyWasteImage } from "../services/wasteClassificationService.js";

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
    "/classify",
    upload.single("image"),
    classifyWaste
);

export default router