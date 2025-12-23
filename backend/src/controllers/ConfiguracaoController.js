const Configuracao = require("../models/Configuracao");

module.exports = {
  async listar(req, res) {
    const configuracoes = await Configuracao.findAll();
    res.json(configuracoes);
  },
  async atualizar(req, res) {
    const { id } = req.params;
    const { metaFaturamento } = req.body;
    await Configuracao.update({ metaFaturamento }, { where: { id } });
    res.json({ mensagem: "Configuração atualizada com sucesso!" });
  },
};
