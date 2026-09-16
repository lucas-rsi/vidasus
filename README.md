## Nota importante

O backend deste projeto passou por uma migração de tecnologia.

* **Versão anterior:** Python + Django
* **Versão atual:** Node.js + Express

A implementação atual do backend utiliza **Node.js com Express**. A versão anterior, desenvolvida em **Python com Django**, foi substituída durante a evolução do projeto.


# VidaSUS

Plataforma digital desenvolvida para facilitar o acesso dos cidadãos a serviços públicos de saúde.

## Funcionalidades

* Login e autenticação de usuários
* Agendamento de consultas
* Visualização e acompanhamento de agendamentos
* Consulta de exames e resultados
* Dashboard com informações do usuário
* Assistente virtual Susi com Inteligência Artificial
* Integração com Google Gemini

## Tecnologias

### Frontend

* React
* Vite
* React Router
* Recharts
* JavaScript

### Backend

* Node.js
* Express
* SQLite
* Better-SQLite3
* CORS
* Google Gemini API
* dotenv

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/lucas-rsi/vidasus.git
cd vidasus
```

### 2. Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Para utilizar o assistente virtual com Gemini, crie um arquivo `.env` dentro da pasta `backend`:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Execute o backend:

```bash
npm start
```

O servidor será iniciado em:

```text
http://127.0.0.1:8000
```

Para desenvolvimento, também é possível utilizar:

```bash
npm run dev
```

### 3. Frontend

Abra outro terminal e entre na pasta `react`:

```bash
cd react
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O Vite disponibilizará o frontend em:

```text
http://localhost:5173
```

## Assistente virtual

O VidaSUS possui a **Susi**, uma assistente virtual integrada à API do Google Gemini.

A integração é realizada pelo backend, mantendo a chave da API protegida por variável de ambiente.

Caso a `GEMINI_API_KEY` não esteja configurada ou a API esteja indisponível, o sistema utiliza uma resposta padrão para manter o chatbot funcionando.

## Banco de dados

O backend utiliza **SQLite** para armazenamento dos dados da aplicação.

O projeto também possui o arquivo:

```text
HackGovDB.sql
```

com a estrutura relacionada ao banco de dados.
