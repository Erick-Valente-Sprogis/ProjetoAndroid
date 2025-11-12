import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import express, {Request, Response} from "express";
import authRoutes from "./routes/authRoutes";
import notaFiscalRoutes from "./routes/notaFiscalRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
// ✅ Servir arquivos estáticos da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rota de "saúde" para verificar se a API está no ar
app.get("/", (req: Request, res: Response) => {
	res.send("API de Notas Fiscais está funcionando!");
});

// ✅ Rota de health para debug
app.get("/api/health", (req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		message: "Backend funcionando!",
	});
});

// ✅ Registro das Rotas Principais COM /api
app.use("/api/auth", authRoutes);
app.use("/api/notas", notaFiscalRoutes);

app.listen(PORT, () => {
	console.log(`🚀 Servidor rodando na porta ${PORT}`);
	console.log(`✅ Backend disponível em: http://localhost:${PORT}`);
	console.log(`✅ Teste: http://localhost:${PORT}/api/health`);
});
