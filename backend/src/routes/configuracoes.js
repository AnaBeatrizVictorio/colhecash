const express = require("express");
const router = express.Router();
const { dbQuery, dbRun } = require("../config/database");

console.log("✅ [ROTAS] configuracoes.js carregado");

// GET - Buscar configurações
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 1;

    console.log(`📖 [GET] /api/configuracoes/${id} - Usuário: ${userId}`);

    const rows = await dbQuery(
      "SELECT * FROM configuracoes WHERE usuario_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      console.log("⚠️ Configuração não encontrada, criando padrão...");

      await dbRun(
        "INSERT INTO configuracoes (usuario_id, metaFaturamento) VALUES (?, ?)",
        [userId, 0]
      );

      return res.json({
        id: 1,
        usuario_id: userId,
        metaFaturamento: 0,
      });
    }

    console.log("✅ Configuração encontrada:", rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Erro ao buscar configuração:", error);
    res.status(500).json({
      message: "Erro ao buscar configuração",
      error: error.message,
    });
  }
});

// PUT - Atualizar meta
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { metaFaturamento } = req.body;
    const userId = 1;

    console.log(`📝 [PUT] /api/configuracoes/${id}`);
    console.log("Meta recebida:", metaFaturamento);

    if (metaFaturamento === undefined || metaFaturamento === null) {
      return res.status(400).json({
        message: "Meta de faturamento não foi enviada",
      });
    }

    const metaNumero = parseFloat(metaFaturamento);

    if (isNaN(metaNumero) || metaNumero < 0) {
      return res.status(400).json({
        message: "Meta inválida",
      });
    }

    const existing = await dbQuery(
      "SELECT * FROM configuracoes WHERE usuario_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      console.log("🆕 Criando nova configuração...");

      await dbRun(
        "INSERT INTO configuracoes (usuario_id, metaFaturamento) VALUES (?, ?)",
        [userId, metaNumero]
      );

      console.log("✅ Configuração criada");
    } else {
      console.log("📝 Atualizando configuração...");

      await dbRun(
        "UPDATE configuracoes SET metaFaturamento = ? WHERE usuario_id = ?",
        [metaNumero, userId]
      );

      console.log("✅ Configuração atualizada");
    }

    res.json({
      message: "Meta salva com sucesso",
      usuario_id: userId,
      metaFaturamento: metaNumero,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar configuração:", error);
    res.status(500).json({
      message: "Erro ao salvar meta",
      error: error.message,
    });
  }
});

console.log(
  "✅ [ROTAS] Rotas de configuracoes registradas: GET /:id, PUT /:id"
);

module.exports = router;
