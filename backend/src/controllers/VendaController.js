const Venda = require('../models/Venda');

module.exports = {
  async listar(req, res) {
    const vendas = await Venda.findAll();
    res.json(vendas);
  },
  async criar(req, res) {
    const venda = await Venda.create(req.body);
    res.json(venda);
  },
  async deletar(req, res) {
    const { id } = req.params;
    await Venda.destroy({ where: { id } });
    res.json({ mensagem: 'Venda deletada com sucesso!' });
  }
};