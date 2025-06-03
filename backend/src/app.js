require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const vendasRoutes = require('./routes/vendas');
const despesasRoutes = require('./routes/despesas');
const configuracoesRoutes = require('./routes/configuracoes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', vendasRoutes);
app.use('/api', despesasRoutes);
app.use('/api', configuracoesRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do ColheCash funcionando!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 