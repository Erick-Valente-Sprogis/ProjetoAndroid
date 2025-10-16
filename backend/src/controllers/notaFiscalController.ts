import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";

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
	// Os dados da nova nota virão no corpo (body) da requisição
	const {
		chave_acesso,
		numero_nf,
		emitente_nome,
		emitente_cnpj,
		data_emissao,
		valor_total,
		url_imagem,
	} = req.body;

	// O UID do admin que está criando a nota vem do middleware
	const criado_por_uid = req.user?.uid;

	// Validação simples para garantir que os campos essenciais foram enviados
	if (!chave_acesso || !numero_nf || !valor_total || !criado_por_uid) {
		return res.status(400).json({
			message:
				"Dados incompletos. Chave de acesso, número e valor total são obrigatórios.",
		});
	}

	try {
		const novaNota = await prisma.notaFiscal.create({
			data: {
				chave_acesso,
				numero_nf,
				emitente_nome,
				emitente_cnpj,
				data_emissao: new Date(data_emissao), // Converte a string de data para o formato Date
				valor_total,
				url_imagem,
				criado_por_uid, // Vincula a nota ao usuário admin que a criou
			},
		});
		// Retorna a nota recém-criada com o status 201 (Created)
		res.status(201).json(novaNota);
	} catch (error) {
		// Tratamento de erro (ex: chave_acesso duplicada)
		res.status(500).json({message: "Erro ao criar nota fiscal.", error});
	}
};
