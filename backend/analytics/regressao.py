"""Regressão logística: cancelado ~ especialidade + hora + dia_semana."""
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

AQUI = Path(__file__).resolve().parent
df = pd.read_csv(AQUI / "dataset.csv")

X = pd.get_dummies(df["especialidade"], prefix="esp").astype(int)
X["hora"] = df["hora"]
X["dia_semana"] = df["dia_semana"]
y = df["cancelado"]

if y.nunique() < 2:
    raise SystemExit("ERRO: só existe uma classe em 'cancelado'; não há o que ajustar.")

# Com N tão pequeno não há como separar treino/teste: métricas são in-sample.
modelo = LogisticRegression(max_iter=1000).fit(X, y)
pred = modelo.predict(X)

rel = classification_report(
    y, pred, labels=[0, 1], target_names=["nao_cancelado", "cancelado"], zero_division=0
)
coef = pd.Series(modelo.coef_[0], index=X.columns).sort_values(key=abs, ascending=False)

texto = (
    f"Regressão logística: cancelado ~ especialidade + hora + dia_semana\n"
    f"N = {len(df)} agendamentos ({int(y.sum())} cancelados)\n"
    f"AVISO: amostra muito pequena; métricas calculadas no próprio treino (sem teste). "
    f"Resultados preliminares.\n\n"
    f"Accuracy: {accuracy_score(y, pred):.3f}\n\n"
    f"Classification report:\n{rel}\n"
    f"Coeficientes (ordenados por magnitude):\n{coef.round(4).to_string()}\n"
    f"Intercepto: {modelo.intercept_[0]:.4f}\n"
)
(AQUI / "relatorio_regressao.txt").write_text(texto, encoding="utf-8")
print(texto)
