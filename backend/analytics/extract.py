"""Extrai o dataset de agendamentos do vidasus.db para dataset.csv."""
import sqlite3
import sys
from pathlib import Path

import pandas as pd

AQUI = Path(__file__).resolve().parent
DB = AQUI.parent / "vidasus.db"
SAIDA = AQUI / "dataset.csv"

con = sqlite3.connect(DB)
df = pd.read_sql_query(
    "SELECT id, cpf_cidadao, data, horario, especialidade, status FROM agendamentos",
    con,
)
con.close()

if df.empty:
    sys.exit("ERRO: tabela agendamentos está vazia. Nada a analisar.")

df["data"] = pd.to_datetime(df["data"], errors="coerce")
df["hora"] = pd.to_numeric(df["horario"].str.split(":").str[0], errors="coerce")
df["dia_semana"] = df["data"].dt.day_of_week  # 0 = segunda
df["cancelado"] = (df["status"].str.lower() == "cancelado").astype(int)
df = df.dropna(subset=["hora", "dia_semana", "especialidade"])

df.to_csv(SAIDA, index=False)
print(f"{len(df)} agendamentos extraídos -> {SAIDA}")
print(f"Colunas: {list(df.columns)}")
print(df["status"].value_counts().to_string())
if len(df) < 50:
    print(f"AVISO: N={len(df)} < 50. Resultados são preliminares.")
