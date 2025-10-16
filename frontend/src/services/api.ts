// frontend/src/services/api.ts
import axios from "axios";

const api = axios.create({
	// O protocolo (http://), o IP e a porta (:3000)
	baseURL: "http://10.57.209.67:3000",
});

export default api;
