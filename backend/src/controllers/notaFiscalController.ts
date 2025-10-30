import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const getAllNotasFiscais = async (req: Request, res: Response) => {
	try {
		// Apenas para exemplo, vamos buscar todas as notas
		const notas = await prisma.notaFiscal.findMany();

		// Podemos ver quem fez a requisição graças ao middleware!
		console.log(`Usuário ${req.user?.uid} solicitou a lista de notas.`);

		res.status(200).json(notas);
	} catch (error) {
		res.status(500).json({message: "Erro ao buscar notas fiscais.", error});
	}
};

export const createNotaFiscal = async (req: Request, res: Response) => {
	// 1. O req.body AGORA VAI ESTAR DEFINIDO
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

	if (!file) {
		return res.status(400).json({message: "Nenhum arquivo PDF foi enviado."});
	}
	// Checagem de segurança para garantir que o body foi preenchido
	if (!chave_acesso || !adminUid || !data_emissao) {
		return res.status(400).json({
			message:
				"Dados incompletos. 'chave_acesso', 'data_emissao' e 'adminUid' (via token) são obrigatórios.",
		});
	}

	try {
		// 2. Lógica de Pastas (Ano/Mês)
		const data = new Date(data_emissao);
		const ano = data.getFullYear().toString();
		const mes = (data.getMonth() + 1).toString().padStart(2, "0");

		// 3. Define os caminhos
		const finalUploadDir = path.join(__dirname, "../../uploads", ano, mes);
		const finalFileName = file.filename;
		const finalFilePath = path.join(finalUploadDir, finalFileName);
		const tempFilePath = file.path;

		// 4. Cria a pasta final (ex: uploads/2025/10)
		fs.mkdirSync(finalUploadDir, {recursive: true});

		// 5. MOVE o arquivo de 'temp' para a pasta final
		fs.renameSync(tempFilePath, finalFilePath);

		// 6. Define o caminho RELATIVO para salvar no DB
		const dbPath = path.join(ano, mes, finalFileName).replace(/\\/g, "/");

		const novaNota = await prisma.notaFiscal.create({
			data: {
				chave_acesso,
				numero_nf,
				emitente_nome: emitente_nome || "",
				emitente_cnpj: emitente_cnpj || "",
				data_emissao: data,
				valor_total: parseFloat(valor_total),
				url_imagem: dbPath,
				criado_por_uid: adminUid,
			},
		});

		res.status(201).json(novaNota);
	} catch (error) {
		// 7. Limpa o arquivo temporário se der erro
		if (file) {
			fs.unlink(file.path, (err) => {
				if (err) console.error("Erro ao limpar arquivo órfão:", err);
			});
		}
		console.error("Erro no createNotaFiscal:", error);
		res
			.status(500)
			.json({message: "Erro ao salvar nota fiscal no banco.", error});
	}
};
