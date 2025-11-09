import axios from "axios";
import { Platform } from "react-native";

// Detecta se está rodando no navegador ou no app
const getBaseURL = () => {
	if (Platform.OS === 'web') {
		// Se for WEB (navegador), use localhost
		return 'http://localhost:3000/api';
	} else {
		// Se for Android/iOS, use o IP da máquina
		return 'http://192.168.1.7:3000/api';
	}
};

const api = axios.create({
	baseURL: getBaseURL(),
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // 10 segundos
});

// Interceptor para debug
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
		if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
			console.error("❌ Backend não está respondendo! URL:", error.config?.baseURL);
		}
		return Promise.reject(error);
	}
);

export default api;