import {PrismaClient} from "@prisma/client";
import {Request, Response} from "express";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const getAllNotasFiscais = async (req: Request, res: Response) => {
	try {
		// Buscar apenas as notas do usuário logado
		const notas = await prisma.notaFiscal.findMany({
			where: {
				criado_por_uid: req.user?.uid,
			},
			orderBy: {
				data_emissao: "desc",
			},
		});

		console.log(`Usuário ${req.user?.uid} solicitou a lista de notas.`);

		res.status(200).json(notas);
	} catch (error) {
		console.error("Erro ao buscar notas:", error);
		res.status(500).json({message: "Erro ao buscar notas fiscais.", error});
	}
};

export const createNotaFiscal = async (req: Request, res: Response) => {
	const {
		chave_acesso,
		numero_nf,
		emitente_nome, // O formulário agora envia este campo
		emitente_cnpj, // Este ainda é opcional
		data_emissao,
		valor_total,
	} = req.body;

	const file = req.file; // Este agora é a 'foto' (e é opcional)
	const adminUid = req.user?.uid;

	// A validação de campos principal agora é feita pelo frontend,
	// mas ainda checamos os campos-chave.
	if (!chave_acesso || !adminUid || !data_emissao || !emitente_nome) {
		return res.status(400).json({message: "Dados incompletos."});
	}

	let dbPath = null; // O arquivo agora é opcional

	try {
		// Se um arquivo FOI enviado, mova-o
		if (file) {
			const data = new Date(data_emissao);
			const ano = data.getFullYear().toString();
			const mes = (data.getMonth() + 1).toString().padStart(2, "0");

			const finalUploadDir = path.join(__dirname, "../../uploads", ano, mes);
			const finalFileName = file.filename;
			const finalFilePath = path.join(finalUploadDir, finalFileName);
			const tempFilePath = file.path;

			fs.mkdirSync(finalUploadDir, {recursive: true});
			fs.renameSync(tempFilePath, finalFilePath);

			// Salva o caminho relativo no DB
			dbPath = path.join(ano, mes, finalFileName).replace(/\\/g, "/");
		}

		const novaNota = await prisma.notaFiscal.create({
			data: {
				chave_acesso,
				numero_nf,
				emitente_nome: emitente_nome, // Agora é obrigatório
				emitente_cnpj: emitente_cnpj || "",
				data_emissao: new Date(data_emissao),
				valor_total: parseFloat(valor_total),

				// Mude 'url_imagem' para 'foto_url' (para bater com o tipo do frontend)
				// e só salve se 'dbPath' não for nulo
				foto_url: dbPath,

				criado_por_uid: adminUid,
			},
		});

		res.status(201).json(novaNota);
	} catch (error) {
		// ... (bloco catch) ...
		console.error("Erro no createNotaFiscal:", error);
		res
			.status(500)
			.json({message: "Erro ao salvar nota fiscal no banco.", error});
	}
};

export const updateNotaFiscal = async (req: Request, res: Response) => {
	const {id} = req.params;
	const {
		chave_acesso,
		numero_nf,
		emitente_nome,
		emitente_cnpj,
		data_emissao,
		valor_total,
	} = req.body;

	const file = req.file;
	const userUid = req.user?.uid;

	if (!userUid) {
		return res.status(401).json({message: "Usuário não autenticado."});
	}

	try {
		// 1. Busca a nota existente
		const notaExistente = await prisma.notaFiscal.findUnique({
			where: {id},
		});

		if (!notaExistente) {
			return res.status(404).json({message: "Nota fiscal não encontrada."});
		}

		// 2. Verifica se o usuário é o dono da nota
		if (notaExistente.criado_por_uid !== userUid) {
			return res
				.status(403)
				.json({message: "Você não tem permissão para editar esta nota."});
		}

		// 3. Se enviou nova foto, processa o upload
		let dbPath = notaExistente.foto_url; // Mantém a foto antiga por padrão

		if (file) {
			const data = new Date(data_emissao || notaExistente.data_emissao);
			const ano = data.getFullYear().toString();
			const mes = (data.getMonth() + 1).toString().padStart(2, "0");

			const finalUploadDir = path.join(__dirname, "../../uploads", ano, mes);
			const finalFileName = file.filename;
			const finalFilePath = path.join(finalUploadDir, finalFileName);
			const tempFilePath = file.path;

			fs.mkdirSync(finalUploadDir, {recursive: true});
			fs.renameSync(tempFilePath, finalFilePath);

			// Remove foto antiga se existir
			if (notaExistente.foto_url) {
				const oldPhotoPath = path.join(
					__dirname,
					"../../uploads",
					notaExistente.foto_url
				);
				if (fs.existsSync(oldPhotoPath)) {
					fs.unlinkSync(oldPhotoPath);
				}
			}

			dbPath = path.join(ano, mes, finalFileName).replace(/\\/g, "/");
		}

		// 4. Atualiza a nota no banco
		const notaAtualizada = await prisma.notaFiscal.update({
			where: {id},
			data: {
				chave_acesso: chave_acesso || notaExistente.chave_acesso,
				numero_nf: numero_nf || notaExistente.numero_nf,
				emitente_nome: emitente_nome || notaExistente.emitente_nome,
				emitente_cnpj: emitente_cnpj || notaExistente.emitente_cnpj,
				data_emissao: data_emissao
					? new Date(data_emissao)
					: notaExistente.data_emissao,
				valor_total: valor_total
					? parseFloat(valor_total)
					: notaExistente.valor_total,
				foto_url: dbPath,
			},
		});

		res.status(200).json(notaAtualizada);
	} catch (error) {
		console.error("Erro no updateNotaFiscal:", error);
		res
			.status(500)
			.json({message: "Erro ao atualizar nota fiscal no banco.", error});
	}
};

export const deleteNotaFiscal = async (req: Request, res: Response) => {
	const {id} = req.params;
	const userUid = req.user?.uid;

	if (!userUid) {
		return res.status(401).json({message: "Usuário não autenticado."});
	}

	try {
		// 1. Busca a nota existente
		const notaExistente = await prisma.notaFiscal.findUnique({
			where: {id},
		});

		if (!notaExistente) {
			return res.status(404).json({message: "Nota fiscal não encontrada."});
		}

		// 2. Verifica se o usuário é o dono da nota
		if (notaExistente.criado_por_uid !== userUid) {
			return res
				.status(403)
				.json({message: "Você não tem permissão para deletar esta nota."});
		}

		// 3. Remove a foto física se existir
		if (notaExistente.foto_url) {
			const photoPath = path.join(
				__dirname,
				"../../uploads",
				notaExistente.foto_url
			);
			if (fs.existsSync(photoPath)) {
				fs.unlinkSync(photoPath);
				console.log("✅ Foto removida:", photoPath);
			}
		}

		// 4. Deleta a nota do banco
		await prisma.notaFiscal.delete({
			where: {id},
		});

		console.log("✅ Nota deletada com sucesso:", id);
		res.status(200).json({message: "Nota fiscal deletada com sucesso."});
	} catch (error) {
		console.error("Erro no deleteNotaFiscal:", error);
		res
			.status(500)
			.json({message: "Erro ao deletar nota fiscal no banco.", error});
	}
};
