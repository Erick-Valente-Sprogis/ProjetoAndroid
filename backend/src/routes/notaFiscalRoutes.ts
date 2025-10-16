// Em: src/routes/notaFiscalRoutes.ts
import {Router} from "express";
import {
	getAllNotasFiscais,
	createNotaFiscal,
} from "../controllers/notaFiscalController";
// A linha abaixo é a que foi corrigida
import {authMiddleware, adminMiddleware} from "../middlewares/authMiddleware";

const router = Router();

// Rota para LER todas as notas (acessível para qualquer usuário logado)
router.get("/", authMiddleware, getAllNotasFiscais);

// Rota para CRIAR notas (acessível apenas para usuários logados E que sejam admins)
router.post("/", authMiddleware, adminMiddleware, createNotaFiscal);

export default router;
