const express = require('express');
const DespesaController = require('../controllers/DespesaController'); // Vamos criar este controlador depois
const authMiddleware = require('../middlewares/auth'); // Importa o middleware de autenticação

const router = express.Router();

// Rota para registrar uma nova despesa
// Exige autenticação para garantir que sabemos qual usuário está registrando a despesa
router.post('/despesas', authMiddleware, DespesaController.createDespesa);

// Rota para listar as despesas do usuário logado
// Exige autenticação para saber de qual usuário buscar as despesas
router.get('/despesas', authMiddleware, DespesaController.getDespesas);

module.exports = router; 