import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const getAllNotasFiscais = async (req: Request, res: Response) => {
	try {
		// Buscar apenas as notas do usuário logado
		const notas = await prisma.notaFiscal.findMany({
			where: {
				criado_por_uid: req.user?.uid
			},
			orderBy: {
				data_emissao: 'desc'
			}
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
		emitente_nome,
		emitente_cnpj,
		data_emissao,
		valor_total,
	} = req.body;

	const file = req.file;
	const adminUid = req.user?.uid;

	// ✅ ARQUIVO AGORA É OPCIONAL - REMOVIDO A VALIDAÇÃO OBRIGATÓRIA!
	
	// Validação dos campos obrigatórios
	if (!chave_acesso || !adminUid || !data_emissao || !numero_nf || !emitente_nome || !valor_total) {
		return res.status(400).json({
			message: "Dados incompletos. 'chave_acesso', 'numero_nf', 'emitente_nome', 'data_emissao' e 'valor_total' são obrigatórios.",
		});
	}

	try {
		let dbPath = null;

		// ✅ SE HOUVER ARQUIVO, PROCESSA. SE NÃO, CONTINUA SEM FOTO
		if (file) {
			// Lógica de Pastas (Ano/Mês)
			const data = new Date(data_emissao);
			const ano = data.getFullYear().toString();
			const mes = (data.getMonth() + 1).toString().padStart(2, "0");

			// Define os caminhos
			const finalUploadDir = path.join(__dirname, "../../uploads", ano, mes);
			const finalFileName = file.filename;
			const finalFilePath = path.join(finalUploadDir, finalFileName);
			const tempFilePath = file.path;

			// Cria a pasta final (ex: uploads/2025/11)
			fs.mkdirSync(finalUploadDir, {recursive: true});

			// MOVE o arquivo de 'temp' para a pasta final
			fs.renameSync(tempFilePath, finalFilePath);

			// Define o caminho RELATIVO para salvar no DB
			dbPath = path.join(ano, mes, finalFileName).replace(/\\/g, "/");
		}

		// Salva no banco (com ou sem foto)
		const novaNota = await prisma.notaFiscal.create({
    data: {
        chave_acesso,
        numero_nf,
        emitente_nome: emitente_nome || "",
        emitente_cnpj: emitente_cnpj || "",
        data_emissao: new Date(data_emissao),
        valor_total: parseFloat(valor_total),
        url_imagem: dbPath || "", // ✅ String vazia ao invés de null
        criado_por_uid: adminUid,
    },
});

		console.log(`✅ Nota fiscal criada: ${novaNota.numero_nf}`);
		res.status(201).json(novaNota);
	} catch (error) {
		// Limpa o arquivo temporário se der erro
		if (file) {
			fs.unlink(file.path, (err) => {
				if (err) console.error("Erro ao limpar arquivo órfão:", err);
			});
		}
		console.error("❌ Erro no createNotaFiscal:", error);
		res.status(500).json({message: "Erro ao salvar nota fiscal no banco.", error});
	}
};