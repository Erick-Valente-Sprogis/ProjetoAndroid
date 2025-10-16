import {Request, Response, NextFunction} from "express";
import {PrismaClient} from "@prisma/client";
import admin from "firebase-admin";
import path from "path";

const prisma = new PrismaClient();

if (!admin.apps.length) {
	const serviceAccount = require(path.join(
		__dirname,
		"../../serviceAccountKey.json"
	));

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

declare global {
	namespace Express {
		interface Request {
			user?: admin.auth.DecodedIdToken;
		}
	}
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const {authorization} = req.headers;

	if (!authorization || !authorization.startsWith("Bearer ")) {
		return res
			.status(401)
			.send({message: "Acesso não autorizado. Token não fornecido."});
	}

	const token = authorization.split("Bearer ")[1];

	// ===== ADICIONANDO A VERIFICAÇÃO AQUI =====
	if (!token) {
		return res.status(401).send({message: "Formato do token inválido."});
	}
	// ===========================================

	try {
		// Agora o TypeScript sabe que 'token' é uma string
		const decodedToken = await admin.auth().verifyIdToken(token);
		req.user = decodedToken;
		next();
	} catch (error) {
		console.error("Erro ao verificar token:", error);
		return res.status(403).send({message: "Token inválido ou expirado."});
	}
};

export const adminMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// ... (seu código do adminMiddleware continua aqui, sem alterações)
	const uid = req.user?.uid;

	if (!uid) {
		return res
			.status(403)
			.send({message: "Acesso negado. UID não encontrado."});
	}

	try {
		const userProfile = await prisma.user.findUnique({
			where: {uid: uid},
		});

		if (!userProfile || userProfile.role !== "admin") {
			return res
				.status(403)
				.send({message: "Acesso negado. Requer permissão de administrador."});
		}

		next();
	} catch (error) {
		return res
			.status(500)
			.send({message: "Erro ao verificar permissões de usuário."});
	}
};
