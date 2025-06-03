const Despesa = require('../models/Despesa').default; // Importa o modelo Despesa (acessando .default)
const User = require('../models/User'); // Precisamos do modelo de usuário para associar a despesa

// Controlador para criar uma nova despesa
exports.createDespesa = async (req, res) => {
  try {
    // O usuário logado está disponível em req.user graças ao authMiddleware
    const usuarioId = req.user.id;
    const { valor, data, descricao, categoria } = req.body; // Extrai valor, data, descricao e categoria do body

    // Cria uma nova instância de Despesa
    const novaDespesa = new Despesa({
      usuario: usuarioId,
      valor,
      data,
      descricao,
      categoria
    });

    // Salva a despesa no banco de dados
    await novaDespesa.save();

    res.status(201).json(novaDespesa); // Retorna a despesa criada com status 201 (Created)
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(400).json({ message: error.message }); // Retorna erro com status 400 (Bad Request)
  }
};

// Controlador para buscar as despesas do usuário logado
exports.getDespesas = async (req, res) => {
  try {
    // O usuário logado está disponível em req.user graças ao authMiddleware
    const usuarioId = req.user.id;

    // Busca todas as despesas associadas a este usuário
    const despesasDoUsuario = await Despesa.find({ usuario: usuarioId }).sort({ data: -1 }); // Ordena por data decrescente

    res.status(200).json(despesasDoUsuario); // Retorna as despesas com status 200 (OK)
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ message: error.message }); // Retorna erro com status 500 (Internal Server Error)
  }
}; 