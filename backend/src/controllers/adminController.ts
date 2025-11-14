import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import admin from "firebase-admin";

const prisma = new PrismaClient();

// GET /api/admin/users - Listar todos os usuários
export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			orderBy: {
				createdAt: "desc",
			},
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

		console.log(`✅ Admin listou ${users.length} usuários`);
		res.status(200).json(users);
	} catch (error) {
		console.error("Erro ao listar usuários:", error);
		res.status(500).json({message: "Erro ao listar usuários"});
	}
};

// PUT /api/admin/users/:id/password - Trocar senha de usuário
export const changeUserPassword = async (req: Request, res: Response) => {
	const {id} = req.params;
	const {newPassword} = req.body;

	if (!newPassword || newPassword.length < 6) {
		return res
			.status(400)
			.json({message: "A senha deve ter no mínimo 6 caracteres"});
	}

	try {
		// Busca o usuário no banco
		const user = await prisma.user.findUnique({
			where: {id},
		});

		if (!user) {
			return res.status(404).json({message: "Usuário não encontrado"});
		}

		// Atualiza a senha no Firebase
		await admin.auth().updateUser(user.uid, {
			password: newPassword,
		});

		console.log(`✅ Admin alterou a senha do usuário: ${user.email}`);
		res.status(200).json({message: "Senha alterada com sucesso"});
	} catch (error) {
		console.error("Erro ao alterar senha:", error);
		res.status(500).json({message: "Erro ao alterar senha"});
	}
};

// PUT /api/admin/users/:id/block - Bloquear usuário
export const blockUser = async (req: Request, res: Response) => {
	const {id} = req.params;

	try {
		const user = await prisma.user.findUnique({
			where: {id},
		});

		if (!user) {
			return res.status(404).json({message: "Usuário não encontrado"});
		}

		// Não permite bloquear admin
		if (user.role === "admin") {
			return res
				.status(403)
				.json({message: "Não é possível bloquear um administrador"});
		}

		// Bloqueia no banco
		await prisma.user.update({
			where: {id},
			data: {isBlocked: true},
		});

		// Desabilita no Firebase
		await admin.auth().updateUser(user.uid, {
			disabled: true,
		});

		console.log(`✅ Admin bloqueou o usuário: ${user.email}`);
		res.status(200).json({message: "Usuário bloqueado com sucesso"});
	} catch (error) {
		console.error("Erro ao bloquear usuário:", error);
		res.status(500).json({message: "Erro ao bloquear usuário"});
	}
};

// PUT /api/admin/users/:id/unblock - Desbloquear usuário
export const unblockUser = async (req: Request, res: Response) => {
	const {id} = req.params;

	try {
		const user = await prisma.user.findUnique({
			where: {id},
		});

		if (!user) {
			return res.status(404).json({message: "Usuário não encontrado"});
		}

		// Desbloqueia no banco
		await prisma.user.update({
			where: {id},
			data: {isBlocked: false},
		});

		// Reabilita no Firebase
		await admin.auth().updateUser(user.uid, {
			disabled: false,
		});

		console.log(`✅ Admin desbloqueou o usuário: ${user.email}`);
		res.status(200).json({message: "Usuário desbloqueado com sucesso"});
	} catch (error) {
		console.error("Erro ao desbloquear usuário:", error);
		res.status(500).json({message: "Erro ao desbloquear usuário"});
	}
};
