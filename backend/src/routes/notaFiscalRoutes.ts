import {Router} from "express";
import {getAllNotasFiscais} from "../controllers/notaFiscalController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

// A MÁGICA ACONTECE AQUI:
// A rota GET para '/' (que será /notas) primeiro passa pelo authMiddleware.
// Se o middleware chamar next(), a requisição continua para getAllNotasFiscais.
router.get("/", authMiddleware, getAllNotasFiscais);

export default router;
