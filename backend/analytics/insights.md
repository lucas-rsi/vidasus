# Parte 3 — Análise Estatística e Decisões

> **Aviso:** o banco tem apenas **5 agendamentos** (1 cancelado). Tudo abaixo é preliminar e serve para demonstrar o método, não para tomar decisões reais. Nenhum dado foi inventado ou adicionado.

## Dataset

`extract.py` leu a tabela `agendamentos` do `vidasus.db` e gerou `dataset.csv` com **5 linhas** e as colunas `id, cpf_cidadao, data, horario, especialidade, status, hora, dia_semana, cancelado`. As colunas `hora`, `dia_semana` (0 = segunda) e `cancelado` (1/0) foram derivadas. Status: 2 Confirmado, 2 Pendente, 1 Cancelado. Cada uma das 5 especialidades aparece uma única vez.

## Correlações

Correlação de Pearson com `cancelado` (heatmap em `correlacao.png`). Top 5:

| Variável | Correlação |
|---|---|
| esp_Pediatria | +1,00 |
| dia_semana | −0,35 |
| esp_Dermatologia | −0,25 |
| esp_Ortopedia | −0,25 |
| esp_Cardiologia | −0,25 |

A correlação de 1,00 com Pediatria é só porque o único cancelamento é de Pediatria e há uma consulta por especialidade. Não indica padrão real.

## Regressão

Regressão logística (`cancelado ~ especialidade + hora + dia_semana`), em `regressao.py`. Com N=5 não há separação treino/teste, então as métricas são calculadas nos próprios dados:

- Accuracy: 0,80
- Classe `cancelado`: precision 0,00, recall 0,00, F1 0,00 (o modelo não acertou o único cancelamento)
- Classe `nao_cancelado`: precision 0,80, recall 1,00, F1 0,89

A accuracy de 0,80 só reflete que 4 de 5 agendamentos não foram cancelados; um modelo que sempre prevê "não cancelado" teria o mesmo resultado. Maiores coeficientes: Pediatria (+0,62), dia_semana (−0,38), Cardiologia (−0,28), pouco peso para hora (−0,06).

## Insights para decisão

- Pediatria tem 100% de cancelamento contra 20% da média geral, mas é 1 consulta em 1.
- O cancelamento ocorreu numa quarta-feira às 10:30; a tendência negativa de `dia_semana` (dias mais tarde na semana, menos cancelamento) se apoia em um único caso.
- A hora do dia quase não pesa no modelo (coeficiente −0,06).
- Decisão possível agora: continuar registrando os agendamentos (incluindo cancelados) e reexecutar os scripts quando houver volume.

## Limitações

- N=5, com 1 caso positivo: não há poder estatístico, as conclusões são **preliminares** e precisam de mais dados (idealmente 50+ agendamentos, com vários cancelamentos por especialidade).
- Métricas sem conjunto de teste, portanto não mostram desempenho em dados novos.
- Sem teste de significância formal; os coeficientes só indicam direção neste conjunto.
- Os scripts estão prontos: com mais dados no banco, basta rodá-los de novo (ou chamar `GET /api/analytics`).
