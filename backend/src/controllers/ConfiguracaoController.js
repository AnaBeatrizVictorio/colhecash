const Configuracao = require('../models/Configuracao').default; // Importa o modelo Configuracao

// Controlador para buscar a configuração do usuário logado
exports.getConfiguracoes = async (req, res) => {
  try {
    const usuarioId = req.user.id; // ID do usuário logado (do authMiddleware)

    // Busca a configuração para o usuário atual. Se não existir, cria uma nova.
    const configuracao = await Configuracao.findOneAndUpdate(
      { usuario: usuarioId },
      { $setOnInsert: { usuario: usuarioId } }, // Cria se não existir
      { upsert: true, new: true } // Retorna a nova configuração se criada
    );

    res.status(200).json(configuracao); // Retorna a configuração encontrada ou criada
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações' });
  }
};

// Controlador para atualizar a configuração do usuário logado
exports.updateConfiguracoes = async (req, res) => {
  try {
    const usuarioId = req.user.id; // ID do usuário logado
    const { metaFaturamento } = req.body; // Dados a serem atualizados

    // Encontra e atualiza a configuração do usuário. upsert: true cria se não existir.
    const configuracao = await Configuracao.findOneAndUpdate(
      { usuario: usuarioId },
      { metaFaturamento }, // Atualiza apenas a metaFaturamento por enquanto
      { upsert: true, new: true, runValidators: true } // runValidators garante que as validações do schema rodem
    );

    res.status(200).json(configuracao); // Retorna a configuração atualizada
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(400).json({ message: 'Erro ao atualizar configurações' });
  }
}; 