const Venda = require('../models/Venda').default;
const User = require('../models/User'); // Precisamos do modelo de usuário para associar a venda

// Controlador para criar uma nova venda
exports.createVenda = async (req, res) => {
  try {
    // O usuário logado está disponível em req.user graças ao authMiddleware
    const usuarioId = req.user.id;
    const { valor, data, descricao, categoria } = req.body;

    // Cria uma nova instância de Venda
    const novaVenda = new Venda({
      usuario: usuarioId,
      valor,
      data,
      descricao,
      categoria
    });

    // Salva a venda no banco de dados
    await novaVenda.save();

    res.status(201).json(novaVenda); // Retorna a venda criada com status 201 (Created)
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(400).json({ message: error.message }); // Retorna erro com status 400 (Bad Request)
  }
};

// Controlador para buscar as vendas do usuário logado
exports.getVendas = async (req, res) => {
  try {
    // O usuário logado está disponível em req.user graças ao authMiddleware
    const usuarioId = req.user.id;

    // Busca todas as vendas associadas a este usuário
    const vendasDoUsuario = await Venda.find({ usuario: usuarioId }).sort({ data: -1 }); // Ordena por data decrescente

    res.status(200).json(vendasDoUsuario); // Retorna as vendas com status 200 (OK)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: error.message }); // Retorna erro com status 500 (Internal Server Error)
  }
}; 