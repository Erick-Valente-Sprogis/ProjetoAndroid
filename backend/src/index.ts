import express, {Request, Response} from "express";
import dotenv from "dotenv";
import notaFiscalRoutes from "./routes/notaFiscalRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rota de "saúde" para verificar se a API está no ar
app.get("/", (req: Request, res: Response) => {
	res.send("API de Notas Fiscais está funcionando!");
});

// --- Registro das Rotas Principais ---
app.use("/auth", authRoutes);
app.use("/notas", notaFiscalRoutes); // A rota /notas agora está aqui, registrada apenas uma vez.

// A linha duplicada que estava aqui foi removida.

app.listen(PORT, () => {
	console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
