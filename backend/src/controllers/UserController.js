const User = require('../models/User');

module.exports = {
  async listar(req, res) {
    const users = await User.findAll();
    res.json(users);
  },
  async criar(req, res) {
    const user = await User.create(req.body);
    res.json(user);
  },
  async deletar(req, res) {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ mensagem: 'Usuário deletado com sucesso!' });
  }
};