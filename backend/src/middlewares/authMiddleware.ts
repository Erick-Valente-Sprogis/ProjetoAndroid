// Em: backend/src/middlewares/authMiddleware.ts

import {Request, Response, NextFunction} from "express";
import {PrismaClient} from "@prisma/client";
import admin from "firebase-admin";
import path from "path";

const prisma = new PrismaClient();

// Garante que o Firebase Admin só seja inicializado uma vez
if (!admin.apps.length) {
	try {
		const serviceAccount = require(path.join(
			__dirname,
			"../../serviceAccountKey.json"
		));

		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
	} catch (error) {
		console.error("FALHA AO LER serviceAccountKey.json:", error);
		console.error(
			"Verifique se o arquivo 'serviceAccountKey.json' existe na raiz da pasta 'backend'."
		);
	}
}

// Declaração para o TypeScript entender o 'req.user'
declare global {
	namespace Express {
		interface Request {
			user?: admin.auth.DecodedIdToken;
		}
	}
}

// --- FERRAMENTA 1 (O Segurança de Login) ---
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

	if (!token) {
		return res.status(401).send({message: "Formato do token inválido."});
	}

	try {
		const decodedToken = await admin.auth().verifyIdToken(token);
		req.user = decodedToken;
		next();
	} catch (error) {
		console.error("Erro ao verificar token:", error);
		return res.status(403).send({message: "Token inválido ou expirado."});
	}
};

// --- FERRAMENTA 2 (O Segurança Admin - A QUE ESTÁ FALTANDO) ---
export const adminMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const uid = req.user?.uid;

	if (!uid) {
		return res
			.status(403)
			.send({message: "Acesso negado. UID não encontrado no token."});
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

		next(); // Usuário é admin! Pode passar.
	} catch (error) {
		return res
			.status(500)
			.send({message: "Erro ao verificar permissões de usuário."});
	}
};
