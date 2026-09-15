const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const agendamentosRoutes = require("./routes/agendamentos");
const examesRoutes = require("./routes/exames");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORTA = 8000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentosRoutes);
app.use("/api/exames", examesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Resposta fixa apenas para manter o Chatbot.jsx funcionando.
app.post("/api/chat/", (_req, res) => {
  res.json({ response: "Olá! Sou o assistente do VidaSUS. Como posso ajudar?" });
});

app.listen(PORTA, () => {
  console.log(`VidaSUS API rodando em http://127.0.0.1:${PORTA}`);
});
