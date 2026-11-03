# Parte 1 — Versão Atual do Projeto e Segurança

**Equipe:** desenvolvimento backend/full-stack: Rafael Bueno e Lucas Richard. Camada de apresentação / UX: Jeferson Farias.

## Evoluções desde a última entrega

O VidaSUS começou na Atividade 4 como um MVP em Java (`Main.java`), com as classes de domínio de agendamento de consultas no SUS. Na Atividade 5 o backend foi migrado para Node.js + Express com banco SQLite (`better-sqlite3`), e entrou a governança de dados, com a tabela `audit_log` que registra ações sobre agendamentos. Na Atividade 6 foram adicionadas consultas SQL avançadas de análise de agendamentos (`backend/rodar_queries.js`) e a assistente virtual Susi, um chatbot integrado ao Gemini que volta a respostas padrão caso a API falhe. Nesta entrega, o foco é segurança: revisão da tríade CIA, definição de políticas técnicas e simulação de ataques. A única implementação nova é um script de backup do banco (`backend/security/backup.js`).

## Tríade CIA no VidaSUS

### Confidencialidade

Garantir que apenas quem tem direito acesse a informação. No VidaSUS, os dados sensíveis são o CPF e os agendamentos e exames dos cidadãos, guardados nas tabelas `usuarios`, `agendamentos` e `exames`.

- O acesso passa por `POST /api/auth/login`, que valida CPF e senha no banco.
- O CORS do backend aceita apenas a origem `http://localhost:5173` (frontend React).
- **Limitação conhecida:** as senhas ficam em texto puro na tabela `usuarios`, e as demais rotas não exigem sessão ou token. Isso fica para evolução futura.

### Integridade

Garantir que os dados não sejam alterados de forma indevida ou não rastreada.

- Todas as consultas usam `db.prepare(...)` com parâmetros (`?`), o que impede que entrada do usuário altere o SQL (SQL injection).
- A tabela `audit_log` registra ação, CPF do usuário, detalhes e timestamp (hoje, criação e cancelamento de agendamentos).
- **Limitação conhecida:** sem hash de senha, quem lê o arquivo do banco lê também as senhas. O `audit_log` não cobre todas as operações, e não há proteção contra alteração do próprio log.

### Disponibilidade

Garantir que o sistema e os dados estejam acessíveis quando necessário. O banco é um único arquivo SQLite (`backend/vidasus.db`), então perdê-lo significa perder todos os dados.

- Esta entrega adiciona o script `backend/security/backup.js`, que copia o banco para `backups/vidasus-<timestamp>.db`. Ele roda manualmente, não há agendamento automático.
- **Risco atual:** não há rate limit, então um volume alto de requisições (ex.: tentativas repetidas de login) pode sobrecarregar o servidor. Também não há réplica do banco.

## Políticas técnicas definidas

| Política | Descrição | Onde se aplica | Status atual |
|---|---|---|---|
| Autenticação | Login por CPF e senha validados no banco. Política-alvo: senhas com hash e sessão por token. | `POST /api/auth/login` (`backend/routes/auth.js`) | Parcial: login funciona, mas senha em texto puro e sem token. Hash e token a implementar |
| Criptografia | Senhas com hash e dados em trânsito via HTTPS. | Tabela `usuarios`; comunicação frontend ↔ backend | A implementar. Hoje não há hash nem HTTPS (desenvolvimento local em HTTP) |
| Backups | Cópia periódica do arquivo do banco, com timestamp, em pasta separada. | `backend/vidasus.db` → `backups/` via `backend/security/backup.js` | Em desenvolvimento: script criado, execução manual, sem agendamento |
| Controles de acesso | Separação por perfil (`CIDADAO` e `GESTOR`): cidadão vê apenas seus dados, gestor vê o painel. | Coluna `usuarios.tipo`; rotas de agendamentos, exames e dashboard | A implementar. O perfil existe no banco, mas as rotas não o verificam. CORS restrito à origem do frontend |

## Cenários de ataque simulados

### Cenário A — SQL injection em endpoint

**Ataque:** um invasor envia no login `cpf = "' OR '1'='1"` e `senha = "' OR '1'='1"`, tentando burlar a autenticação. A mesma ideia vale para `cpf_cidadao`, `especialidade` e outros campos enviados nas demais rotas.

**Resposta atual:** as consultas usam parâmetros (`WHERE cpf = ? AND senha = ?`). O `better-sqlite3` trata a entrada como valor, não como SQL, então o texto malicioso é comparado literalmente, não encontra usuário e a API responde `401 CPF ou senha incorretos.`. **Status: mitigado.**

**Resiliência:** como nenhuma rota concatena entrada do usuário em SQL, novos endpoints seguem o mesmo padrão. Um ponto de atenção é que a tentativa não gera registro em `audit_log` e não há rate limit, então o invasor pode repetir tentativas sem bloqueio.

### Cenário B — Perda ou corrupção do arquivo `vidasus.db`

**Ataque / falha:** o arquivo do banco é apagado, corrompido ou sobrescrito (por invasão, falha de disco ou erro de operação). Sem cópia, todos os usuários, agendamentos, exames e o `audit_log` são perdidos.

**Resposta atual:** com `node backend/security/backup.js`, existe uma cópia em `backups/vidasus-<timestamp>.db`. Para recuperar: parar o servidor, copiar o backup mais recente para `backend/vidasus.db` e subir o servidor novamente. **Status: resiliente após esta entrega**, com a ressalva de que dados criados depois do último backup são perdidos.

**Resiliência:** a frequência do backup define a perda máxima de dados. Hoje o backup é manual e fica na mesma máquina do banco, então ainda não protege contra perda total do servidor. Agendamento e cópia externa ficam para evolução futura.
