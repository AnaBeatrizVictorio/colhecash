import mongoose from 'mongoose';

const VendaSchema = new mongoose.Schema({
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

const Venda = mongoose.model('Venda', VendaSchema);

export default Venda; 