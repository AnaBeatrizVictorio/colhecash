const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  async register(req, res) {
    try {
      const { nome, email, telefone, senha } = req.body;

      // Verifica se o usuário já existe
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      // Cria o usuário
      const user = await User.create({
        nome,
        email,
        telefone,
        senha,
      });

      // Remove a senha do retorno
      user.senha = undefined;

      // Gera o token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(201).json({ user, token });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Erro ao criar usuário' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Busca o usuário
      const user = await User.findOne({ email }).select('+senha');

      if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado' });
      }

      // Verifica a senha
      if (!await bcrypt.compare(senha, user.senha)) {
        return res.status(400).json({ message: 'Senha inválida' });
      }

      // Remove a senha do retorno
      user.senha = undefined;

      // Gera o token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({ user, token });
    } catch (error) {
      return res.status(400).json({ message: 'Erro ao fazer login' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nome, telefone, fotoPerfil, identificacao, senha } = req.body;
      const userId = req.userId;

      const updateData = {
        nome,
        telefone,
        fotoPerfil,
        identificacao,
      };

      if (senha) {
        updateData.senha = senha;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      user.senha = undefined;
      return res.json({ user });
    } catch (error) {
      return res.status(400).json({ message: 'Erro ao atualizar perfil' });
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      user.senha = undefined;
      return res.json({ user });
    } catch (error) {
      return res.status(400).json({ message: 'Erro ao buscar perfil' });
    }
  },
}; 