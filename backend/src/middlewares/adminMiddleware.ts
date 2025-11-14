import {Request, Response, NextFunction} from "express";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const adminMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const uid = req.user?.uid;

		if (!uid) {
			return res.status(401).json({message: "Não autenticado"});
		}

		// Busca o usuário no banco
		const user = await prisma.user.findUnique({
			where: {uid},
		});

		if (!user) {
			return res.status(404).json({message: "Usuário não encontrado"});
		}

		// Verifica se é admin
		if (user.role !== "admin") {
			return res
				.status(403)
				.json({message: "Acesso negado. Apenas administradores."});
		}

		// Se chegou aqui, é admin
		next();
	} catch (error) {
		console.error("Erro no adminMiddleware:", error);
		res.status(500).json({message: "Erro ao verificar permissões"});
	}
};
