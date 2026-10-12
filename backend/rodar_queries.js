const Database = require('better-sqlite3');
const db = new Database('vidasus.db');

console.log('=== QUERY 1: Agendamentos por especialidade ===');
console.table(db.prepare(`
  SELECT especialidade, COUNT(*) AS total,
    SUM(CASE WHEN status = 'Confirmado' THEN 1 ELSE 0 END) AS confirmados,
    ROUND(100.0 * SUM(CASE WHEN status = 'Cancelado' THEN 1 ELSE 0 END) / COUNT(*), 1) AS taxa_cancelamento_pct
  FROM agendamentos GROUP BY especialidade ORDER BY taxa_cancelamento_pct DESC
`).all());

console.log('=== QUERY 2: Cidadãos com cancelamentos ===');
console.table(db.prepare(`
  SELECT cpf_cidadao, COUNT(*) AS total_cancelamentos
  FROM agendamentos WHERE status = 'Cancelado'
    AND cpf_cidadao IN (
      SELECT cpf_cidadao FROM agendamentos
      GROUP BY cpf_cidadao HAVING COUNT(*) >= 2
    )
  GROUP BY cpf_cidadao ORDER BY total_cancelamentos DESC
`).all());

console.log('=== QUERY 3: Últimos agendamentos com nome do cidadão ===');
console.table(db.prepare(`
  SELECT a.id, u.nome, a.especialidade, a.status, a.data, a.horario
  FROM agendamentos a
  JOIN usuarios u ON a.cpf_cidadao = u.cpf
  ORDER BY a.data DESC, a.horario DESC LIMIT 10
`).all());
