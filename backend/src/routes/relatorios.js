const express = require('express');
const RelatorioController = require('../controllers/RelatorioController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/relatorios/gerar-pdf', authMiddleware, RelatorioController.gerarPDF);
router.post('/relatorios/gerar-excel', authMiddleware, RelatorioController.gerarExcel);

module.exports = router;