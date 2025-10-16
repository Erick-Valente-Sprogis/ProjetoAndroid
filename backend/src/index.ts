import express, {Request, Response} from "express";
import dotenv from "dotenv";
import notaFiscalRoutes from "./routes/notaFiscalRoutes"; // Importa nossas rotas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota de "saúde"
app.get("/", (req: Request, res: Response) => {
	res.send("API de Notas Fiscais está funcionando!");
});

// Diz ao Express para usar nossas rotas de notas fiscais no caminho '/notas'
app.use("/notas", notaFiscalRoutes);

app.listen(PORT, () => {
	console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
