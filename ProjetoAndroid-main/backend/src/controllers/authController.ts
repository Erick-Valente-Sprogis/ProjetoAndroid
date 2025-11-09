// Em: backend/src/controllers/authController.ts

import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import admin from "firebase-admin";

const prisma = new PrismaClient();

export const getMyProfile = async (req: Request, res: Response) => {
	const uid = req.user?.uid;
	if (!uid) {
		return res.status(401).json({message: "Não autorizado"});
	}
	try {
		const userProfile = await prisma.user.findUnique({where: {uid}});
		if (!userProfile) {
			return res
				.status(404)
				.json({message: "Perfil de usuário não encontrado no banco de dados."});
		}
		res.status(200).json(userProfile);
	} catch (error) {
		res.status(500).json({message: "Erro ao buscar perfil do usuário."});
	}
};

export const registerUser = async (req: Request, res: Response) => {
	// 1. Pega os dados enviados pelo frontend
	const {email, password, fullName, phone} = req.body;

	// 2. Validação básica dos dados
	if (!email || !password || !fullName) {
		return res
			.status(400)
			.json({message: "E-mail, senha e nome completo são obrigatórios."});
	}

	try {
		// 3. Usa o Firebase ADMIN SDK para criar o usuário no sistema de autenticação
		const userRecord = await admin.auth().createUser({
			email,
			password,
			displayName: fullName,
		});

		// 4. Se o passo 3 funcionou, cria o perfil do usuário no NOSSO banco de dados (Prisma)
		//    Usando o UID do Firebase como a "ponte" entre os dois sistemas.
		const userProfile = await prisma.user.create({
			data: {
				uid: userRecord.uid,
				email: userRecord.email!, // O '!' diz ao TypeScript que temos certeza que o e-mail existe
				fullName,
				phone: phone || "", // Define como string vazia se o telefone não for enviado
			},
		});

		// 5. Retorna uma resposta de sucesso com o perfil criado
		res.status(201).json(userProfile);
	} catch (error: any) {
		console.error("Erro ao registrar usuário:", error); // Loga o erro completo no console do backend

		// 6. Tratamento de erros comuns
		if (error.code === "auth/email-already-exists") {
			return res
				.status(409)
				.json({message: "Este endereço de e-mail já está em uso."});
		}

		return res.status(500).json({message: "Erro interno ao criar o usuário."});
	}
};
