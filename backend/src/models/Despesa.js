import mongoose from 'mongoose';

const DespesaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  descricao: { 
    type: String,
    required: false 
  },
  categoria: { 
    type: String,
    required: false 
  }
});

const Despesa = mongoose.model('Despesa', DespesaSchema);

export default Despesa; 