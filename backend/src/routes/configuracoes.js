const express = require('express');
const ConfiguracaoController = require('../controllers/ConfiguracaoController'); // Importa o controlador
const authMiddleware = require('../middlewares/auth'); // Importa o middleware de autenticação

const router = express.Router();

// Todas as rotas de configuração exigem autenticação
router.use(authMiddleware);

// Rota para buscar as configurações do usuário logado
router.get('/configuracoes', ConfiguracaoController.getConfiguracoes);

// Rota para atualizar as configurações do usuário logado
router.put('/configuracoes', ConfiguracaoController.updateConfiguracoes);

module.exports = router; 