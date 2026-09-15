const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "vidasus.db"));

db.pragma("foreign_keys = ON");

// ── Esquema ─────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf_cidadao TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    especialidade TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente'
  );

  CREATE TABLE IF NOT EXISTS exames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf_cidadao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    resultado TEXT NOT NULL,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acao TEXT NOT NULL,
    cpf_usuario TEXT NOT NULL,
    detalhes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Dados iniciais ──────────────────────────────────────────
const USUARIOS = [
  { nome: "João Silva", cpf: "12345678900", senha: "123", tipo: "CIDADAO" },
  { nome: "Maria Souza", cpf: "98765432100", senha: "123", tipo: "CIDADAO" },
  { nome: "Dr. Carlos", cpf: "00000000000", senha: "admin", tipo: "GESTOR" },
];

const AGENDAMENTOS = [
  { cpf_cidadao: "12345678900", data: "2025-05-20", horario: "09:00", especialidade: "Cardiologia", status: "Confirmado" },
  { cpf_cidadao: "12345678900", data: "2025-05-22", horario: "14:00", especialidade: "Clínico Geral", status: "Pendente" },
  { cpf_cidadao: "98765432100", data: "2025-05-21", horario: "10:30", especialidade: "Pediatria", status: "Cancelado" },
  { cpf_cidadao: "98765432100", data: "2025-05-23", horario: "08:00", especialidade: "Ortopedia", status: "Confirmado" },
  { cpf_cidadao: "12345678900", data: "2025-05-25", horario: "11:00", especialidade: "Dermatologia", status: "Pendente" },
];

const EXAMES = [
  { cpf_cidadao: "12345678900", tipo: "Hemograma Completo", resultado: "Normal", data: "2025-03-10" },
  { cpf_cidadao: "12345678900", tipo: "Glicemia em Jejum", resultado: "108 mg/dL (limítrofe)", data: "2025-03-10" },
];

function popularBanco() {
  const inserirUsuario = db.prepare(
    "INSERT INTO usuarios (nome, cpf, senha, tipo) VALUES (@nome, @cpf, @senha, @tipo)"
  );
  const inserirAgendamento = db.prepare(
    `INSERT INTO agendamentos (cpf_cidadao, data, horario, especialidade, status)
     VALUES (@cpf_cidadao, @data, @horario, @especialidade, @status)`
  );
  const inserirExame = db.prepare(
    `INSERT INTO exames (cpf_cidadao, tipo, resultado, data)
     VALUES (@cpf_cidadao, @tipo, @resultado, @data)`
  );

  // Cada tabela é populada apenas se ainda estiver vazia, para que o banco
  // não seja duplicado a cada reinicialização do servidor.
  const semeadura = db.transaction(() => {
    if (db.prepare("SELECT COUNT(*) AS total FROM usuarios").get().total === 0) {
      USUARIOS.forEach((u) => inserirUsuario.run(u));
    }
    if (db.prepare("SELECT COUNT(*) AS total FROM agendamentos").get().total === 0) {
      AGENDAMENTOS.forEach((a) => inserirAgendamento.run(a));
    }
    if (db.prepare("SELECT COUNT(*) AS total FROM exames").get().total === 0) {
      EXAMES.forEach((e) => inserirExame.run(e));
    }
  });

  semeadura();
}

popularBanco();

function registrarAuditoria(acao, cpfUsuario, detalhes) {
  db.prepare(
    "INSERT INTO audit_log (acao, cpf_usuario, detalhes) VALUES (?, ?, ?)"
  ).run(acao, cpfUsuario, detalhes ?? null);
}

module.exports = { db, registrarAuditoria };
