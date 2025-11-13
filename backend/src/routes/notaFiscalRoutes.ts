// Em: backend/src/routes/notaFiscalRoutes.ts
import {Router} from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
	createNotaFiscal,
	getAllNotasFiscais,
	updateNotaFiscal,
	deleteNotaFiscal,
} from "../controllers/notaFiscalController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

const tempUploadDir = path.join(__dirname, "../../uploads/temp");
fs.mkdirSync(tempUploadDir, {recursive: true});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, tempUploadDir);
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

// Criar nota (qualquer usuário autenticado)
router.post("/", authMiddleware, upload.single("foto"), createNotaFiscal);

// Atualizar nota (usuário pode editar suas próprias notas)
router.put("/:id", authMiddleware, upload.single("foto"), updateNotaFiscal);

// Deletar nota (usuário pode deletar suas próprias notas)
router.delete("/:id", authMiddleware, deleteNotaFiscal);

export default router;
