const Despesa = require('../models/Despesa');

module.exports = {
  async listar(req, res) {
    const despesas = await Despesa.findAll();
    res.json(despesas);
  },
  async criar(req, res) {
    const despesa = await Despesa.create(req.body);
    res.json(despesa);
  },
  async deletar(req, res) {
    const { id } = req.params;
    await Despesa.destroy({ where: { id } });
    res.json({ mensagem: 'Despesa deletada com sucesso!' });
  }
};