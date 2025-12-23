const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('\nÌ¥ß INICIALIZANDO BANCO DE DADOS...\n');
console.log('Ì≥Ç Caminho:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
  console.log('\nÌ≥ã Criando tabelas...\n');

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('‚ùå Erro:', err);
    else console.log('‚úÖ Tabela usuarios criada');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      descricao TEXT,
      valor REAL NOT NULL,
      data DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('‚ùå Erro:', err);
    else console.log('‚úÖ Tabela vendas criada');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS despesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      descricao TEXT,
      valor REAL NOT NULL,
      data DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('‚ùå Erro:', err);
    else console.log('‚úÖ Tabela despesas criada');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      metaFaturamento REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `, async (err) => {
    if (err) {
      console.error('‚ùå Erro:', err);
    } else {
      console.log('‚úÖ Tabela configuracoes criada');
      console.log('\nÌ±§ Criando usu√°rio de teste...\n');

      const senha = await bcrypt.hash('123456', 10);

      db.run(
        'INSERT OR REPLACE INTO usuarios (id, nome, email, senha) VALUES (?, ?, ?, ?)',
        [1, 'Usu√°rio Teste', 'teste@email.com', senha],
        (err) => {
          if (err) {
            console.error('‚ùå Erro ao criar usu√°rio:', err);
          } else {
            console.log('‚úÖ Usu√°rio criado:');
            console.log('   Email: teste@email.com');
            console.log('   Senha: 123456');

            db.run(
              'INSERT OR REPLACE INTO configuracoes (usuario_id, metaFaturamento) VALUES (?, ?)',
              [1, 0],
              (err) => {
                if (err) {
                  console.error('‚ùå Erro ao criar configura√ß√£o:', err);
                } else {
                  console.log('‚úÖ Configura√ß√£o padr√£o criada\n');
                  console.log('‚úÖ BANCO INICIALIZADO COM SUCESSO!\n');
                  db.close();
                }
              }
            );
          }
        }
      );
    }
  });
});
