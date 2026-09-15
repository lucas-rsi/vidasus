const express = require("express");
const { db } = require("../database");

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", (_req, res) => {
  const { total, confirmados, cancelados, pendentes } = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(status = 'Confirmado') AS confirmados,
              SUM(status = 'Cancelado')  AS cancelados,
              SUM(status = 'Pendente')   AS pendentes
         FROM agendamentos`
    )
    .get();

  const porEspecialidadeRows = db
    .prepare(
      `SELECT especialidade, COUNT(*) AS total
         FROM agendamentos
        GROUP BY especialidade
        ORDER BY especialidade`
    )
    .all();

  const porEspecialidade = {};
  porEspecialidadeRows.forEach((linha) => {
    porEspecialidade[linha.especialidade] = linha.total;
  });

  const agendamentos = db
    .prepare(
      `SELECT a.id,
              a.cpf_cidadao AS cpf,
              u.nome        AS cidadao,
              a.data,
              a.horario,
              a.especialidade,
              a.status
         FROM agendamentos a
         LEFT JOIN usuarios u ON u.cpf = a.cpf_cidadao
        ORDER BY a.data, a.horario`
    )
    .all();

  res.json({
    total,
    confirmados: confirmados ?? 0,
    cancelados: cancelados ?? 0,
    pendentes: pendentes ?? 0,
    taxaNoShow: total > 0 ? ((cancelados ?? 0) / total) * 100 : 0,
    porEspecialidade,
    agendamentos,
  });
});

module.exports = router;
