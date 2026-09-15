const express = require("express");
const { db } = require("../database");

const router = express.Router();

// GET /api/exames?cpf=
router.get("/", (req, res) => {
  const { cpf } = req.query;

  if (!cpf) {
    return res.status(400).json({ error: "Parâmetro cpf é obrigatório." });
  }

  const exames = db
    .prepare(
      `SELECT id, tipo, resultado, data
         FROM exames
        WHERE cpf_cidadao = ?
        ORDER BY data DESC`
    )
    .all(String(cpf));

  res.json(exames);
});

module.exports = router;
