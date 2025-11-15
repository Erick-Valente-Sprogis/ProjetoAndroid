import {Router} from "express";
import {PrismaClient} from "@prisma/client"; // ✅ ADICIONE ESTE IMPORT
import {authMiddleware} from "../middlewares/authMiddleware";
import {getMyProfile, registerUser} from "../controllers/authController";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

// ✅ CONFIGURAÇÃO DO MULTER (antes das rotas)
const profileUploadDir = path.join(__dirname, "../../uploads/profiles");
fs.mkdirSync(profileUploadDir, {recursive: true});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, profileUploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const extension = path.extname(file.originalname);
		cb(null, `profile-${uniqueSuffix}${extension}`);
	},
});

const upload = multer({storage: storage});

// ===== ROTAS =====

router.post("/register", registerUser);
router.get("/me", authMiddleware, getMyProfile);

router.get("/health", (req, res) => {
	console.log("!!! ROTA DE HEALTH /api/auth/health FOI ATINGIDA !!!");
	res
		.status(200)
		.json({message: "As rotas de autenticação estão funcionando!"});
});

// PUT /api/auth/profile - Atualiza perfil do usuário (apenas phone)
router.put("/profile", authMiddleware, async (req, res) => {
	try {
		const uid = req.user?.uid;
		const {phone, fullName} = req.body; // ✅ ADICIONE fullName AQUI

		console.log("📝 Dados recebidos:", {uid, phone, fullName}); // ✅ LOG

		if (!uid) {
			return res.status(401).json({message: "Não autenticado"});
		}

		// Busca o usuário atual
		const userAtual = await prisma.user.findUnique({
			where: {uid},
		});

		if (!userAtual) {
			return res.status(404).json({message: "Usuário não encontrado"});
		}

		// ✅ Verifica se o usuário é admin para permitir editar fullName
		const podeMudarNome = userAtual.role === "admin";

		console.log("👑 É admin?", podeMudarNome); // ✅ LOG

		// Monta o objeto de atualização
		const updateData: any = {};

		if (phone !== undefined) {
			updateData.phone = phone;
		}

		// ✅ ADMIN pode atualizar fullName
		if (fullName !== undefined && podeMudarNome) {
			updateData.fullName = fullName;
			console.log("✅ Nome será atualizado para:", fullName); // ✅ LOG
		}

		console.log("📦 Update data:", updateData); // ✅ LOG

		// Atualiza o perfil
		const userAtualizado = await prisma.user.update({
			where: {uid},
			data: updateData,
			select: {
				id: true,
				uid: true,
				email: true,
				fullName: true,
				phone: true,
				photoURL: true,
				role: true,
				isBlocked: true,
				createdAt: true,
			},
		});

		console.log(`✅ Perfil atualizado:`, userAtualizado); // ✅ LOG
		res.status(200).json(userAtualizado);
	} catch (error) {
		console.error("❌ Erro ao atualizar perfil:", error);
		res.status(500).json({message: "Erro ao atualizar perfil"});
	}
});

// POST /api/auth/profile/photo - Upload de foto de perfil
router.post(
	"/profile/photo",
	authMiddleware,
	upload.single("photo"),
	async (req, res) => {
		try {
			const uid = req.user?.uid;
			const file = req.file;

			if (!uid) {
				return res.status(401).json({message: "Não autenticado"});
			}

			if (!file) {
				return res.status(400).json({message: "Nenhuma foto enviada"});
			}

			// Busca o usuário atual
			const userAtual = await prisma.user.findUnique({
				where: {uid},
			});

			if (!userAtual) {
				return res.status(404).json({message: "Usuário não encontrado"});
			}

			// Remove foto antiga se existir
			if (userAtual.photoURL) {
				const oldPhotoPath = path.join(
					__dirname,
					"../../uploads",
					userAtual.photoURL
				);
				if (fs.existsSync(oldPhotoPath)) {
					fs.unlinkSync(oldPhotoPath);
					console.log("✅ Foto antiga removida:", oldPhotoPath);
				}
			}

			// Caminho relativo da nova foto
			const photoURL = `profiles/${file.filename}`;

			// Atualiza no banco
			const userAtualizado = await prisma.user.update({
				where: {uid},
				data: {photoURL},
				select: {
					id: true,
					uid: true,
					email: true,
					fullName: true,
					phone: true,
					photoURL: true,
					role: true,
					isBlocked: true,
					createdAt: true,
				},
			});

			console.log(`✅ Foto de perfil atualizada: ${uid}`);
			res.status(200).json(userAtualizado);
		} catch (error) {
			console.error("Erro ao fazer upload da foto:", error);
			res.status(500).json({message: "Erro ao fazer upload da foto"});
		}
	}
);

export default router;
