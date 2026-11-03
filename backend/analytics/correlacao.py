"""Correlação entre cancelamento e especialidade, hora e dia da semana."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

AQUI = Path(__file__).resolve().parent
df = pd.read_csv(AQUI / "dataset.csv")

X = pd.get_dummies(df["especialidade"], prefix="esp").astype(int)
X["hora"] = df["hora"]
X["dia_semana"] = df["dia_semana"]
X["cancelado"] = df["cancelado"]

# Variáveis constantes geram NaN; ficam 0 para não quebrar o gráfico.
corr = X.corr(method="pearson").fillna(0)

print(f"N = {len(df)} agendamentos")
top = corr["cancelado"].drop("cancelado").sort_values(key=abs, ascending=False)
print("Top 5 correlações com cancelado (Pearson):")
print(top.head(5).round(3).to_string())

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1, ax=ax)
ax.set_title(f"Correlação com cancelamento (N={len(df)}, amostra muito pequena)")
fig.tight_layout()
fig.savefig(AQUI / "correlacao.png", dpi=150)
print("Gráfico salvo em correlacao.png")
