const express = require("express");
const { db } = require("../database");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { cpf, senha } = req.body ?? {};

  if (!cpf || !senha) {
    return res.status(400).json({ error: "CPF e senha são obrigatórios." });
  }

  const usuario = db
    .prepare("SELECT nome, cpf, tipo FROM usuarios WHERE cpf = ? AND senha = ?")
    .get(String(cpf), String(senha));

  if (!usuario) {
    return res.status(401).json({ error: "CPF ou senha incorretos." });
  }

  res.json(usuario);
});

module.exports = router;
