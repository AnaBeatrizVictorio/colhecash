const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dbQuery, dbRun, dbGet } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_super_secreto_aqui_12345";

console.log("✅ [ROTAS] auth.js carregado");

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    console.log("��� [POST] /api/auth/register");
    console.log("Dados recebidos:", { nome, email });

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const existingUser = await dbGet("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await dbRun("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senhaHash]);

    console.log("✅ Usuário criado:", result.id);

    await dbRun("INSERT INTO configuracoes (usuario_id, metaFaturamento) VALUES (?, ?)", [result.id, 0]);

    const token = jwt.sign({ id: result.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      usuario: { id: result.id, nome, email },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log("��� [POST] /api/auth/login");
    console.log("Email:", email);

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    const usuario = await dbGet("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("✅ Login bem-sucedido:", usuario.email);

    res.json({
      message: "Login realizado com sucesso",
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (error) {
    console.error("❌ Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login", error: error.message });
  }
});

console.log("✅ [ROTAS] Rotas de auth registradas: POST /register, POST /login");

module.exports = router;
