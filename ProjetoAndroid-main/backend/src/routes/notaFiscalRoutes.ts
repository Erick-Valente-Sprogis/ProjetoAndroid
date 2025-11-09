// Em: src/routes/notaFiscalRoutes.ts
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
	createNotaFiscal,
	getAllNotasFiscais,
} from "../controllers/notaFiscalController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const tempUploadDir = path.join(__dirname, "../../uploads/temp");
fs.mkdirSync(tempUploadDir, {recursive: true});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir); // Salva tudo em 'temp'
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, "file-" + uniqueSuffix + extension);
    },
});

const upload = multer({storage: storage});

// Listar notas (usuários autenticados)
router.get("/", authMiddleware, getAllNotasFiscais);

// ✅ CRIAR notas (REMOVIDO adminMiddleware - qualquer usuário autenticado pode criar)
router.post(
    "/",
    authMiddleware,
    // adminMiddleware, ← REMOVIDO!
    upload.single("foto"), // Mudei de "pdf" para "foto" (o frontend envia como "foto")
    createNotaFiscal
);

export default router;