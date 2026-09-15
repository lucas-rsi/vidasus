require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenAI } = require("@google/genai");

const authRoutes = require("./routes/auth");
const agendamentosRoutes = require("./routes/agendamentos");
const examesRoutes = require("./routes/exames");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

const PORTA = 8000;

// ==========================================
// CONFIGURAÇÃO DO GEMINI
// ==========================================

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  console.log("Chave do Gemini encontrada. IA habilitada.");
} else {
  console.log(
    "GEMINI_API_KEY não encontrada. Chatbot funcionando com resposta padrão."
  );
}

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// ==========================================
// ROTAS
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/agendamentos", agendamentosRoutes);

app.use("/api/exames", examesRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ==========================================
// CHATBOT
// ==========================================

app.post("/api/chat/", async (req, res) => {
  const mensagem = req.body?.message;

  // Se o frontend não enviar uma mensagem
  if (!mensagem) {
    return res.json({
      response: "Olá! Sou o assistente do VidaSUS. Como posso ajudar?",
    });
  }

  // ==========================================
  // SEM CHAVE DO GEMINI
  // ==========================================

  if (!ai) {
    return res.json({
      response: "Olá! Sou o assistente do VidaSUS. Como posso ajudar?",
    });
  }

  // ==========================================
  // TENTA USAR O GEMINI
  // ==========================================

  try {
    const resposta = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: mensagem,
      config: {
        systemInstruction: `
Você é o assistente virtual do VidaSUS. Seu nome é Susi, no feminino.

O VidaSUS é uma plataforma voltada para facilitar o acesso dos cidadãos
a serviços públicos de saúde.

Ajude o usuário de forma clara, objetiva e educada.

Você pode explicar funcionalidades do sistema, como:
- agendamento de consultas;
- visualização de exames;
- informações sobre atendimentos;
- utilização da plataforma;
- navegação pelo VidaSUS.

Não invente informações sobre consultas, médicos, exames ou agendamentos
que não estejam disponíveis no sistema.

Não faça diagnósticos médicos nem substitua um profissional de saúde.

Se o usuário apresentar uma situação aparentemente emergencial,
oriente-o a procurar imediatamente um serviço de emergência adequado.

Responda sempre em português do Brasil.
        `,
      },
    });

    return res.json({
      response: resposta.text,
    });
  } catch (error) {
    console.error("Erro ao consultar o Gemini:", error.message);

    // ==========================================
    // FALLBACK
    // ==========================================
    // Se a chave for inválida, API estiver indisponível,
    // houver erro de conexão etc., o chatbot continua funcionando.

    return res.json({
      response: "Olá! Sou o assistente do VidaSUS. Como posso ajudar?",
    });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

app.listen(PORTA, () => {
  console.log(`VidaSUS API rodando em http://127.0.0.1:${PORTA}`);
});