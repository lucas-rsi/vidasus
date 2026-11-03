# Parte 2 — Redes de Comunicação

**Autoria:** Desenvolvimento backend/full-stack: Rafael Bueno e Lucas Richard. Camada de apresentação / UX: Jeferson Farias.

## Redes no VidaSUS

O VidaSUS usa a topologia **cliente-servidor**. O cliente é a aplicação React/Vite, que roda no navegador do cidadão ou do gestor. Ele se comunica pela rede, usando requisições HTTP em formato JSON, com o servidor Express (`backend/server.js`), que expõe as rotas de autenticação, agendamentos, exames, dashboard e chatbot. O servidor é o único componente que acessa o banco SQLite local (`backend/vidasus.db`): o navegador nunca fala com o banco diretamente, o que reduz a superfície de ataque. Hoje, em desenvolvimento, o frontend roda em `http://localhost:5173` e o CORS do servidor está configurado para aceitar apenas essa origem. Em produção, o desenho esperado é navegador ↔ HTTPS ↔ Express ↔ SQLite. O chatbot Susi também depende da rede, pois o servidor chama a API do Gemini, e há um fallback para respostas padrão caso essa chamada falhe.

## Segurança em Redes

Na rede, o que mais se aplica ao projeto é:

- **HTTPS/TLS na borda**, entre cliente e servidor, para proteger em trânsito dados sensíveis como CPF, senha e resultados de exames. Na versão atual o servidor roda em HTTP, porque é um ambiente local de desenvolvimento. Em produção, o TLS deve ser terminado na borda, por exemplo em um proxy reverso na frente do Express.
- **CORS restrito**: o servidor só aceita requisições do navegador vindas de `http://localhost:5173`, então páginas de outras origens não conseguem usar a API a partir do navegador do usuário. Vale lembrar que o CORS é uma proteção do navegador e não substitui autenticação.
- **Headers de segurança**: como evolução futura, sugere-se o `helmet`, que adiciona cabeçalhos HTTP de proteção (como `X-Content-Type-Options` e `Strict-Transport-Security`). Não foi implementado nesta entrega.
- **Validação de entrada**: os dados que chegam pela rede não são confiáveis. O risco de injeção de SQL já é mitigado porque as consultas usam parâmetros (`?`) no `better-sqlite3`.

Limitação conhecida: a senha ainda é comparada em texto puro no login. Isso está fora do escopo desta parte, mas torna o TLS ainda mais importante enquanto o problema não for corrigido.

## Resiliência em Redes

Resiliência é a capacidade do sistema de continuar funcionando ou se recuperar depois de uma falha. Nesta entrega, a base é o **backup automatizado** da Parte 1 (`backend/security/backup.js`), que copia o arquivo do banco para a pasta `backups/` com data e hora no nome. Isso permite recuperar o estado em caso de falha de disco ou corrupção do arquivo. Não há **redundância de servidor** nesta entrega: existe uma única instância do Express e um único arquivo SQLite, que formam um ponto único de falha. Isso fica registrado como evolução futura (por exemplo, mais de uma instância atrás de um balanceador, com banco replicado). O **plano de recuperação** se o SQLite corromper é: (1) parar o servidor; (2) guardar o arquivo corrompido para análise; (3) escolher o backup mais recente em `backups/`; (4) copiá-lo para `backend/vidasus.db`; (5) subir o servidor e testar o login e a listagem de agendamentos. Dados criados depois do último backup são perdidos, então a frequência do backup define a perda máxima aceitável.

## Confiança e a Tríade CIA

A confiança dos usuários no HackGov depende de a rede sustentar os três pilares da Tríade CIA:

- **Confidencialidade:** o TLS criptografa o canal, e quem captura o tráfego não lê CPF, senha nem exames. O CORS restrito impede que origens não autorizadas usem a API pelo navegador do usuário.
- **Integridade:** o TLS também detecta alterações no caminho, garantindo que os dados cheguem ao servidor como foram enviados. No servidor, a tabela `audit_log` registra as ações (quem, o quê e quando), o que permite auditar o que foi feito no sistema.
- **Disponibilidade:** o sistema precisa estar acessível quando o cidadão for marcar uma consulta. No estado atual, a disponibilidade é protegida por backup local, que ajuda a restaurar o serviço. Como evolução, a replicação do banco e de instâncias do servidor reduziria o tempo fora do ar.

## Conclusão

Os conceitos de redes mostram que um sistema público não depende só de funcionar, mas também de ser seguro, recuperável e confiável. Canal criptografado, origem restrita e logs protegem os dados do cidadão e dão transparência sobre o que acontece no sistema. Backup e, no futuro, redundância mantêm o serviço disponível e eficiente. Assim, a rede contribui diretamente para os objetivos do HackGov de eficiência e transparência.
