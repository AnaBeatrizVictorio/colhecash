const jwt = require("jsonwebtoken");
const { dbGet } = require("../config/database");

const JWT_SECRET =
  process.env.JWT_SECRET || "seu_segredo_super_secreto_aqui_12345";

console.log("✅ [MIDDLEWARE] auth.js carregado");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔍 [AUTH] Verificando token...");
    console.log("🔍 [AUTH] Header:", authHeader ? "✅ Presente" : "❌ Ausente");

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("🔍 [AUTH] Token decodificado - ID:", decoded.id);

    // Buscar usuário no banco
    const usuario = await dbGet(
      "SELECT id, nome, email FROM usuarios WHERE id = ?",
      [decoded.id]
    );

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    console.log("✅ [AUTH] Usuário autenticado:", usuario.email);

    // Adicionar usuário à requisição
    req.usuarioId = usuario.id;
    req.usuario = usuario;

    return next();
  } catch (error) {
    console.error("❌ [AUTH] Erro:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }

    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = authMiddleware;
