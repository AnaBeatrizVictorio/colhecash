const express = require("express");
const cors = require("cors");
const os = require("os");
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'sua-chave-secreta-super-segura-123';

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(middlewares);
app.use(jsonServer.bodyParser);

// ✅ MIDDLEWARE DE LOG
app.use((req, res, next) => {
  console.log(`\n📥 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  console.log(`🌐 IP: ${req.ip}`);
  next();
});

// Rota de Login
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  
  const db = router.db;
  const usuario = db.get('usuarios').find({ email }).value();
  
  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign({ id: usuario.id }, SECRET_KEY, { expiresIn: '7d' });
  
  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  });
});

// Middleware de autenticação
app.use((req, res, next) => {
  // Ignora autenticação para login
  if (req.path === '/api/auth/login' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Verifica token apenas para rotas /api/*
  if (req.path.startsWith('/api/')) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.usuarioId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } else {
    next();
  }
});

// ✅ ROTAS - IMPORTAR
const authRoutes = require("./routes/auth");
const vendaRoutes = require("./routes/venda");
const despesaRoutes = require("./routes/despesa");
const configuracoesRoutes = require("./routes/configuracoes");

// ✅ ROTAS - REGISTRAR
app.use("/api/auth", authRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/despesas", despesaRoutes);
app.use("/api/configuracoes", configuracoesRoutes); // ⚠️ ESTA LINHA É CRUCIAL

// Rota de teste
app.get("/", (req, res) => {
  console.log("✅ Rota raiz acessada");
  res.json({ message: "API ColheCash funcionando!" });
});

app.get("/api", (req, res) => {
  console.log("✅ Rota /api acessada");
  res.json({ message: "API rodando", timestamp: new Date() });
});

// Obter IPs locais
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((net) => {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    });
  });
  
  return ips;
}

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPs();
  
  console.log("\n🚀 Servidor rodando em:");
  console.log(`   http://localhost:${PORT}`);
  ips.forEach(ip => console.log(`   http://${ip}:${PORT}`));
  
  console.log("\n📋 Endpoints:");
  console.log("   GET  /");
  console.log("   GET  /api");
  console.log("   POST /api/auth/login");
  console.log("   POST /api/auth/register");
  console.log("   GET  /api/vendas");
  console.log("   POST /api/vendas");
  console.log("   GET  /api/despesas");
  console.log("   POST /api/despesas");
  console.log("   GET  /api/configuracoes/:id");
  console.log("   PUT  /api/configuracoes/:id");
  console.log("\n⏳ Aguardando requisições...\n");
});

module.exports = app;