const express = require('express');
const DespesaController = require('../controllers/DespesaController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Agora as rotas são apenas '/' porque o app.js já registra como '/api/despesas'
router.post('/despesas', authMiddleware, DespesaController.createDespesa);
router.get('/despesas', authMiddleware, DespesaController.getDespesas);

module.exports = router;