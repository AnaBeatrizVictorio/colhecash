const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../database.sqlite");

console.log("��� Caminho do banco:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco SQLite:", err);
  } else {
    console.log("✅ Conectado ao banco SQLite");
  }
});

// Função para executar queries que retornam múltiplas linhas
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("❌ Erro na query:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para executar queries que retornam uma única linha
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error("❌ Erro na query:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Função para executar INSERT, UPDATE, DELETE
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error("❌ Erro ao executar:", err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = { db, dbQuery, dbGet, dbRun };
