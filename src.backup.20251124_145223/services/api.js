import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_IP = "192.168.0.102"; // ⚠️ SEU IP AQUI
const BACKEND_PORT = "3000";
const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

console.log("🔧 [API] Configuração:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição (COM TOKEN)
api.interceptors.request.use(
  async (config) => {
    console.log("📤 [API]", config.method.toUpperCase(), config.url);

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 [API] Token adicionado:", token.substring(0, 30) + "...");
      } else {
        console.log("⚠️ [API] Sem token no AsyncStorage");
      }
    } catch (error) {
      console.error("❌ [API] Erro ao buscar token:", error);
    }

    return config;
  },
  (error) => {
    console.error("❌ [API] Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    console.log("✅ [API] Status:", response.status);
    return response;
  },
  (error) => {
    console.error("\n❌ [API] ERRO:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Dados:", error.response.data);

      if (error.response.status === 401) {
        console.error("🔒 Token inválido ou não enviado");
      }
    } else if (error.request) {
      console.error("❌ Sem resposta do servidor");
    } else {
      console.error("Erro:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
