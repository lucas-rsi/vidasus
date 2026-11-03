const express = require("express");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const router = express.Router();

const PASTA = __dirname;
const VENV_PYTHON = path.join(PASTA, "..", "..", ".venv", "bin", "python");
const PYTHON = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3";

// GET /api/analytics — roda extract.py, correlacao.py e regressao.py
router.get("/", async (req, res) => {
  try {
    const saidas = {};
    for (const script of ["extract", "correlacao", "regressao"]) {
      const { stdout } = await execFileAsync(PYTHON, [
        path.join(PASTA, `${script}.py`),
      ]);
      saidas[script] = stdout;
    }
    res.json({
      ...saidas,
      relatorio_regressao: fs.readFileSync(
        path.join(PASTA, "relatorio_regressao.txt"),
        "utf-8"
      ),
      grafico: "backend/analytics/correlacao.png",
    });
  } catch (error) {
    res.status(500).json({ erro: "Falha ao executar análise", detalhe: error.message });
  }
});

module.exports = router;
