const express = require('express');
const VendaController = require('../controllers/VendaController'); // Vamos criar este controlador depois
const authMiddleware = require('../middlewares/auth'); // Importa o middleware de autenticação

const router = express.Router();

// Rota para registrar uma nova venda
// Exige autenticação (authMiddleware) para garantir que sabemos qual usuário está registrando a venda
router.post('/vendas', authMiddleware, VendaController.createVenda);

// Rota para listar as vendas do usuário logado
// Exige autenticação para saber de qual usuário buscar as vendas
router.get('/vendas', authMiddleware, VendaController.getVendas);

module.exports = router; 