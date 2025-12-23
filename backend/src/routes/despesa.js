const express = require("express");
const router = express.Router();
const { dbQuery, dbRun } = require("../config/database");

console.log("‚úÖ [ROTAS] despesa.js carregado");

router.get("/", async (req, res) => {
  try {
    const userId = 1;
    console.log(`Ì≥ñ [GET] /api/despesas - Usu√°rio: ${userId}`);

    const rows = await dbQuery(
      "SELECT * FROM despesas WHERE usuario_id = ? ORDER BY data DESC",
      [userId]
    );

    console.log(`‚úÖ ${rows.length} despesas encontradas`);
    res.json(rows);
  } catch (error) {
    console.error("‚ùå Erro ao buscar despesas:", error);
    res.status(500).json({ message: "Erro ao buscar despesas", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { descricao, valor, data } = req.body;
    const userId = 1;

    console.log(`Ì≥ù [POST] /api/despesas - Usu√°rio: ${userId}`);
    console.log("Dados:", { descricao, valor, data });

    if (!valor || !data) {
      return res.status(400).json({ message: "Valor e data s√£o obrigat√≥rios" });
    }

    const result = await dbRun(
      "INSERT INTO despesas (usuario_id, descricao, valor, data) VALUES (?, ?, ?, ?)",
      [userId, descricao, valor, data]
    );

    console.log("‚úÖ Despesa criada:", result.id);

    res.status(201).json({
      message: "Despesa registrada com sucesso",
      id: result.id,
    });
  } catch (error) {
    console.error("‚ùå Erro ao criar despesa:", error);
    res.status(500).json({ message: "Erro ao registrar despesa", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 1;

    console.log(`Ì∑ëÔ∏è [DELETE] /api/despesas/${id} - Usu√°rio: ${userId}`);

    const result = await dbRun(
      "DELETE FROM despesas WHERE id = ? AND usuario_id = ?",
      [id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Despesa n√£o encontrada" });
    }

    console.log("‚úÖ Despesa deletada:", id);
    res.json({ message: "Despesa deletada com sucesso" });
  } catch (error) {
    console.error("‚ùå Erro ao deletar despesa:", error);
    res.status(500).json({ message: "Erro ao deletar despesa", error: error.message });
  }
});

console.log("‚úÖ [ROTAS] Rotas de despesa registradas: GET /, POST /, DELETE /:id");

module.exports = router;
