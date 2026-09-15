const express = require("express");
const { db, registrarAuditoria } = require("../database");

const router = express.Router();

// O nome do cidadão não é guardado no agendamento: vem sempre de `usuarios`.
const SELECT_AGENDAMENTO = `
  SELECT a.id,
         a.cpf_cidadao AS cpf,
         u.nome        AS cidadao,
         a.data,
         a.horario,
         a.especialidade,
         a.status
    FROM agendamentos a
    LEFT JOIN usuarios u ON u.cpf = a.cpf_cidadao
`;

// GET /api/agendamentos?cpf=
router.get("/", (req, res) => {
  const { cpf } = req.query;

  if (!cpf) {
    return res.status(400).json({ error: "Parâmetro cpf é obrigatório." });
  }

  const agendamentos = db
    .prepare(`${SELECT_AGENDAMENTO} WHERE a.cpf_cidadao = ? ORDER BY a.data, a.horario`)
    .all(String(cpf));

  res.json(agendamentos);
});

// POST /api/agendamentos
router.post("/", (req, res) => {
  const { cpf, data, horario, especialidade } = req.body ?? {};

  if (!cpf || !data || !horario || !especialidade) {
    return res
      .status(400)
      .json({ error: "cpf, data, horario e especialidade são obrigatórios." });
  }

  const info = db
    .prepare(
      `INSERT INTO agendamentos (cpf_cidadao, data, horario, especialidade, status)
       VALUES (?, ?, ?, ?, 'Pendente')`
    )
    .run(String(cpf), String(data), String(horario), String(especialidade));

  registrarAuditoria(
    "CRIADO",
    String(cpf),
    `Agendamento #${info.lastInsertRowid} - ${especialidade} em ${data} às ${horario}`
  );

  const novo = db
    .prepare(`${SELECT_AGENDAMENTO} WHERE a.id = ?`)
    .get(info.lastInsertRowid);

  res.status(201).json(novo);
});

// PATCH /api/agendamentos/:id/cancelar
router.patch("/:id/cancelar", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id inválido." });
  }

  const agendamento = db
    .prepare("SELECT id, cpf_cidadao, status FROM agendamentos WHERE id = ?")
    .get(id);

  if (!agendamento) {
    return res.status(404).json({ error: "Agendamento não encontrado." });
  }

  db.prepare("UPDATE agendamentos SET status = 'Cancelado' WHERE id = ?").run(id);

  registrarAuditoria("CANCELADO", agendamento.cpf_cidadao, `Agendamento #${id}`);

  res.json(db.prepare(`${SELECT_AGENDAMENTO} WHERE a.id = ?`).get(id));
});

module.exports = router;
