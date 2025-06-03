import mongoose from 'mongoose';

const ConfiguracaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Garante que cada usuário tenha apenas uma configuração
  },
  metaFaturamento: {
    type: Number,
    required: false, // Pode não ter uma meta definida inicialmente
    default: 0
  }
  // Futuramente, outras configurações podem ser adicionadas aqui
});

const Configuracao = mongoose.model('Configuracao', ConfiguracaoSchema);

export default Configuracao; 