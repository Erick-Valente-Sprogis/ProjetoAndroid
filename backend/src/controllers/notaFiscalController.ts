import {Request, Response} from "express";
import fs from "fs";
import path from "path";
import prisma from "../prisma";

const uploadsDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadsDir, {recursive: true});

// ✅ Listar TODAS as notas fiscais
export const getAllNotasFiscais = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const notas = await prisma.notaFiscal.findMany({
			orderBy: {
				data_emissao: "desc",
			},
		});

		res.json(notas);
	} catch (error) {
		console.error("Erro ao buscar notas fiscais:", error);
		res.status(500).json({message: "Erro ao buscar notas fiscais"});
	}
};

// Criar nota fiscal
export const createNotaFiscal = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {chave_acesso, numero_nf, data_emissao, valor_total, emitente_nome} =
			req.body;

		const uid = req.user?.uid;

		if (!uid) {
			res.status(401).json({message: "Usuário não autenticado"});
			return;
		}

		let finalPhotoName: string | undefined;

		if (req.file) {
			const extension = path.extname(req.file.originalname);
			finalPhotoName = `nota-${Date.now()}${extension}`;
			const finalPath = path.join(uploadsDir, finalPhotoName);
			fs.renameSync(req.file.path, finalPath);
		}

		const nota = await prisma.notaFiscal.create({
			data: {
				chave_acesso,
				numero_nf,
				data_emissao: new Date(data_emissao),
				valor_total: parseFloat(valor_total),
				emitente_nome,
				foto_url: finalPhotoName,
				criado_por_uid: uid, // ✅ CORRETO! Nome do campo no schema
			},
		});

		res.status(201).json(nota);
	} catch (error) {
		console.error("Erro ao criar nota fiscal:", error);
		res.status(500).json({message: "Erro ao criar nota fiscal"});
	}
};

// Atualizar nota fiscal
export const updateNotaFiscal = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {id} = req.params;
		const {chave_acesso, numero_nf, data_emissao, valor_total, emitente_nome} =
			req.body;

		const uid = req.user?.uid;

		if (!uid) {
			res.status(401).json({message: "Usuário não autenticado"});
			return;
		}

		const notaExistente = await prisma.notaFiscal.findUnique({
			where: {id},
		});

		if (!notaExistente) {
			res.status(404).json({message: "Nota fiscal não encontrada"});
			return;
		}

		let finalPhotoName = notaExistente.foto_url;

		if (req.file) {
			if (notaExistente.foto_url) {
				const oldPhotoPath = path.join(uploadsDir, notaExistente.foto_url);
				if (fs.existsSync(oldPhotoPath)) {
					fs.unlinkSync(oldPhotoPath);
				}
			}

			const extension = path.extname(req.file.originalname);
			finalPhotoName = `nota-${Date.now()}${extension}`;
			const finalPath = path.join(uploadsDir, finalPhotoName);
			fs.renameSync(req.file.path, finalPath);
		}

		const notaAtualizada = await prisma.notaFiscal.update({
			where: {id},
			data: {
				chave_acesso,
				numero_nf,
				data_emissao: new Date(data_emissao),
				valor_total: parseFloat(valor_total),
				emitente_nome,
				foto_url: finalPhotoName,
			},
		});

		res.json(notaAtualizada);
	} catch (error) {
		console.error("Erro ao atualizar nota fiscal:", error);
		res.status(500).json({message: "Erro ao atualizar nota fiscal"});
	}
};

// Deletar nota fiscal
export const deleteNotaFiscal = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {id} = req.params;
		const uid = req.user?.uid;

		if (!uid) {
			res.status(401).json({message: "Usuário não autenticado"});
			return;
		}

		const notaExistente = await prisma.notaFiscal.findUnique({
			where: {id},
		});

		if (!notaExistente) {
			res.status(404).json({message: "Nota fiscal não encontrada"});
			return;
		}

		if (notaExistente.foto_url) {
			const photoPath = path.join(uploadsDir, notaExistente.foto_url);
			if (fs.existsSync(photoPath)) {
				fs.unlinkSync(photoPath);
			}
		}

		await prisma.notaFiscal.delete({
			where: {id},
		});

		res.json({message: "Nota fiscal deletada com sucesso"});
	} catch (error) {
		console.error("Erro ao deletar nota fiscal:", error);
		res.status(500).json({message: "Erro ao deletar nota fiscal"});
	}
};
