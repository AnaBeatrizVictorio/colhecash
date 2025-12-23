require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const vendasRoutes = require("./routes/vendas");
const despesasRoutes = require("./routes/despesas");
const configuracoesRoutes = require("./routes/configuracoes");
const relatoriosRoutes = require("./routes/relatorios");
const iaRoutes = require("./routes/ia");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ ADICIONAR: Log de verificação do .env
console.log("🔍 Verificando variáveis de ambiente:");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Definida" : "❌ Não encontrada"
);
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "✅ Definida" : "❌ Não encontrada"
);
console.log("PORT:", process.env.PORT || 3000);

app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log(
    "Headers:",
    req.headers.authorization ? "Token presente" : "Sem token"
  );
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado ao MongoDB");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
    console.log("⚠️  Tentando continuar sem MongoDB...");
  });

// Rota de teste (ANTES das outras rotas)
app.get("/", (req, res) => {
  res.json({ message: "API do ColheCash funcionando!" });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api", vendasRoutes);
app.use("/api", despesasRoutes);
app.use("/api", configuracoesRoutes);
app.use("/api", relatoriosRoutes);
app.use("/api/ia", iaRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("\n❌ ERRO CAPTURADO:");
  console.error("Mensagem:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: err.message,
    path: req.path,
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log("⚠️  Aguardando conexão com MongoDB...\n");
});

module.exports = app;
