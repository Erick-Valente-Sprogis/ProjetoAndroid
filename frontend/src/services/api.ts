import axios from "axios";

const api = axios.create({
	baseURL: "http://192.168.1.2:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

// Interceptors de log
api.interceptors.request.use(
	(config) => {
		console.log("🔵 Requisição:", config.method?.toUpperCase(), config.url);
		return config;
	},
	(error) => {
		console.error("🔴 Erro na requisição:", error);
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => {
		console.log("🟢 Resposta:", response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error("🔴 Erro na resposta:", error.message);
		if (
			error.code === "ERR_NETWORK" ||
			error.code === "ECONNABORTED" ||
			error.response?.status === 404
		) {
			console.error(
				`❌ ERRO DE CONEXÃO! A API não foi encontrada ou está offline.`
			);
			console.error("Verifique se o backend está rodando.");
		}
		return Promise.reject(error);
	}
);

export default api;
