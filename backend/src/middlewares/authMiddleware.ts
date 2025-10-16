import {Request, Response, NextFunction} from "express";
import admin from "firebase-admin";
import path from "path";

// Carrega as credenciais e inicializa o Firebase Admin
const serviceAccount = require(path.join(
	__dirname,
	"../../../serviceAccountKey.json"
));

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// Estendendo a interface Request do Express para incluir nossa propriedade 'user'
declare global {
	namespace Express {
		interface Request {
			user?: admin.auth.DecodedIdToken;
		}
	}
}

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
		return res
			.status(401)
			.send({message: "Acesso não autorizado. Token não fornecido."});
	}

	try {
		const decodedToken = await admin.auth().verifyIdToken(token);
		req.user = decodedToken; // Adiciona os dados do usuário à requisição
		next(); // Continua para a próxima função (a lógica da rota)
	} catch (error) {
		console.error("Erro ao verificar token:", error);
		return res.status(403).send({message: "Token inválido ou expirado."});
	}
};
