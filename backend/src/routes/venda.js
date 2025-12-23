const express = require("express");
const router = express.Router();
const { dbQuery, dbRun } = require("../config/database");

console.log("‚úÖ [ROTAS] venda.js carregado");

router.get("/", async (req, res) => {
  try {
    const userId = 1;
    console.log(`Ì≥ñ [GET] /api/vendas - Usu√°rio: ${userId}`);

    const rows = await dbQuery(
      "SELECT * FROM vendas WHERE usuario_id = ? ORDER BY data DESC",
      [userId]
    );

    console.log(`‚úÖ ${rows.length} vendas encontradas`);
    res.json(rows);
  } catch (error) {
    console.error("‚ùå Erro ao buscar vendas:", error);
    res.status(500).json({ message: "Erro ao buscar vendas", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { descricao, valor, data } = req.body;
    const userId = 1;

    console.log(`Ì≥ù [POST] /api/vendas - Usu√°rio: ${userId}`);
    console.log("Dados:", { descricao, valor, data });

    if (!valor || !data) {
      return res.status(400).json({ message: "Valor e data s√£o obrigat√≥rios" });
    }

    const result = await dbRun(
      "INSERT INTO vendas (usuario_id, descricao, valor, data) VALUES (?, ?, ?, ?)",
      [userId, descricao, valor, data]
    );

    console.log("‚úÖ Venda criada:", result.id);

    res.status(201).json({
      message: "Venda registrada com sucesso",
      id: result.id,
    });
  } catch (error) {
    console.error("‚ùå Erro ao criar venda:", error);
    res.status(500).json({ message: "Erro ao registrar venda", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 1;

    console.log(`Ì∑ëÔ∏è [DELETE] /api/vendas/${id} - Usu√°rio: ${userId}`);

    const result = await dbRun(
      "DELETE FROM vendas WHERE id = ? AND usuario_id = ?",
      [id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Venda n√£o encontrada" });
    }

    console.log("‚úÖ Venda deletada:", id);
    res.json({ message: "Venda deletada com sucesso" });
  } catch (error) {
    console.error("‚ùå Erro ao deletar venda:", error);
    res.status(500).json({ message: "Erro ao deletar venda", error: error.message });
  }
});

console.log("‚úÖ [ROTAS] Rotas de venda registradas: GET /, POST /, DELETE /:id");

module.exports = router;
