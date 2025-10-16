import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware"; // Importe o authMiddleware
import {getMyProfile, registerUser} from "../controllers/authController"; // Importe getMyProfile

const router = Router();

router.post("/register", registerUser);
router.get("/me", authMiddleware, getMyProfile);

export default router;
