// Backup do banco SQLite: copia backend/vidasus.db para backups/vidasus-<timestamp>.db
// Uso: node backend/security/backup.js
const fs = require("fs");
const path = require("path");

const ORIGEM = path.join(__dirname, "..", "vidasus.db");
const PASTA_BACKUPS = path.join(__dirname, "..", "..", "backups");

if (!fs.existsSync(ORIGEM)) {
  console.error(`Banco não encontrado: ${ORIGEM}`);
  process.exit(1);
}

fs.mkdirSync(PASTA_BACKUPS, { recursive: true });

// ":" não é permitido em nomes de arquivo no Windows
const timestamp = new Date().toISOString().replace(/:/g, "-");
const destino = path.join(PASTA_BACKUPS, `vidasus-${timestamp}.db`);

fs.copyFileSync(ORIGEM, destino);
console.log(`Backup criado: ${destino}`);
