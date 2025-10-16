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
