import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ MUDE AQUI PARA SEU IP
const BACKEND_IP = "192.168.0.102";
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

// Interceptor de requisição
api.interceptors.request.use(
  async (config) => {
    console.log("\n[INTERCEPTOR] Iniciando...");
    console.log("🌐 [API] URL completa:", config.baseURL + config.url);

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        console.log("🔍 [INTERCEPTOR] Token no AsyncStorage: ✅ EXISTE");
        console.log(
          "🔑 [INTERCEPTOR] Token (primeiros 30 chars):",
          token.substring(0, 30) + "..."
        );
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ [INTERCEPTOR] Header Authorization adicionado");
      } else {
        console.log("⚠️ [INTERCEPTOR] Token não encontrado no AsyncStorage");
      }
    } catch (error) {
      console.error("❌ [INTERCEPTOR] Erro ao buscar token:", error);
    }

    console.log(
      "📤 [INTERCEPTOR] Requisição:",
      config.method.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    console.error("❌ [INTERCEPTOR] Erro na configuração:", error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    console.log("✅ [RESPOSTA] Status:", response.status);
    console.log("📄 [RESPOSTA] URL:", response.config.url);
    return response;
  },
  (error) => {
    console.error("\n❌ [ERRO NA REQUISIÇÃO]");
    console.error("URL tentada:", error.config?.baseURL + error.config?.url);

    if (error.code === "ECONNABORTED") {
      console.error("❌ [RESPOSTA] Timeout - Servidor não respondeu em 30s");
      console.error("Verifique se o backend está rodando em:", BASE_URL);
    } else if (error.response) {
      console.error("❌ [RESPOSTA] Erro:", error.response.status);
      console.error("📄 [RESPOSTA] Dados:", error.response.data);
    } else if (error.request) {
      console.error("❌ [RESPOSTA] Sem resposta do servidor");
      console.error("Verifique se o backend está rodando em:", BASE_URL);
      console.error("Verifique se você está na mesma rede Wi-Fi");
    } else {
      console.error("❌ [RESPOSTA] Erro:", error.message);
    }

    if (error.response?.status === 401) {
      console.log("🔒 Token inválido ou expirado. Redirecionando para login...");
    }

    return Promise.reject(error);
  }
);

export default api;
