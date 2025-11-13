// Em: frontend/src/services/api.ts

import axios from "axios";
import {Platform} from "react-native";

// 1. A URL do túnel é a NOSSA ÚNICA VERDADE
// Ela funciona na Web e no Mobile e já inclui o prefixo '/api'
const getBaseURL = () => {
	if (Platform.OS === "web") {
		// ✅ Para WEB (navegador), use localhost
		return "http://localhost:3000/api";
	} else {
		// Para Android/iOS, use o túnel
		return "https://erick-projeto-nf.loca.lt/api";
	}
};

const api = axios.create({
	baseURL: getBaseURL(),
	headers: {
		"Content-Type": "application/json",
		"Bypass-Tunnel-Reminder": "true",
	},
	timeout: 10000,
});

// 3. Seus interceptors de log (do seu colega) são ótimos e podem ficar!
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
