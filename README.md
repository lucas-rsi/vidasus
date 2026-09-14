# VidaSUS

Plataforma digital de atendimento e agendamento em saúde pública, desenvolvida para o Enterprise Challenge da FIAP.

## Funcionalidades

- Agendamento de consultas
- Acompanhamento de agendamentos
- Consulta de exames e resultados
- Informações sobre especialidades
- Histórico de atendimentos
- Assistente virtual Susi com Inteligência Artificial

## Tecnologias

- React
- Python
- Django
- Django REST Framework
- Google Gemini API

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/lucas-rsi/vidasus.git
cd vidasus
```

2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Execute o servidor:

```bash
python manage.py runserver
```

3. Frontend

Em outro terminal:

```bash
cd react
npm install
npm run dev
```

