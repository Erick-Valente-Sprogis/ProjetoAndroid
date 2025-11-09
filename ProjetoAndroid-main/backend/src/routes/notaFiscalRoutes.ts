// Em: src/routes/notaFiscalRoutes.ts
import {Router} from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
	getAllNotasFiscais,
	createNotaFiscal,
} from "../controllers/notaFiscalController";
import {authMiddleware, adminMiddleware} from "../middlewares/authMiddleware";

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

router.get("/", authMiddleware, getAllNotasFiscais);

// Rota para CRIAR notas (acessível apenas para usuários logados E que sejam admins)
router.post(
	"/",
	authMiddleware,
	adminMiddleware,
	upload.single("pdf"), // <-- ADICIONE ESTA LINHA
	createNotaFiscal
);

export default router;
