import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {adminMiddleware} from "../middlewares/adminMiddleware";
import {
	getAllUsers,
	changeUserPassword,
	blockUser,
	unblockUser,
} from "../controllers/adminController";

const router = Router();

// Todas as rotas requerem autenticação E permissão de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users - Listar todos os usuários
router.get("/users", getAllUsers);

// PUT /api/admin/users/:id/password - Trocar senha de usuário
router.put("/users/:id/password", changeUserPassword);

// PUT /api/admin/users/:id/block - Bloquear usuário
router.put("/users/:id/block", blockUser);

// PUT /api/admin/users/:id/unblock - Desbloquear usuário
router.put("/users/:id/unblock", unblockUser);

export default router;
