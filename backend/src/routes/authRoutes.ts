import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware"; // Importe o authMiddleware
import {getMyProfile, registerUser} from "../controllers/authController"; // Importe getMyProfile

const router = Router();

router.post("/register", registerUser);
router.get("/me", authMiddleware, getMyProfile);

router.get("/health", (req, res) => {
	console.log("!!! ROTA DE HEALTH /api/auth/health FOI ATINGIDA !!!");
	res
		.status(200)
		.json({message: "As rotas de autenticação estão funcionando!"});
});

export default router;
