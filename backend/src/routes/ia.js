const express = require("express");
const router = express.Router();
const IAController = require("../controllers/IAController");
const authMiddleware = require("../middlewares/auth"); // ✅ CORRIGIDO

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Análise financeira inteligente do mês
router.post("/analisar-mes", IAController.analisarMes);

// Chat com IA
router.post("/chat", IAController.chat);

module.exports = router;
