const express = require('express');
const VendaController = require('../controllers/VendaController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Agora as rotas são apenas '/' porque o app.js já registra como '/api/vendas'
router.post('/vendas', authMiddleware, VendaController.createVenda);
router.get('/vendas', authMiddleware, VendaController.getVendas);

module.exports = router;