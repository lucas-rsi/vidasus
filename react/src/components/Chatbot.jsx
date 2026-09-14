import { useState } from "react";

export default function Chatbot() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([
    {
      tipo: "bot",
      texto: "Olá! Sou o assistente do VidaSUS. Como posso ajudar?",
    },
  ]);

  const [carregando, setCarregando] = useState(false);

  async function enviarMensagem(e) {
    e.preventDefault();

    const texto = mensagem.trim();

    if (!texto) return;

    // Adiciona a mensagem do usuário
    setMensagens((anteriores) => [
      ...anteriores,
      {
        tipo: "usuario",
        texto: texto,
      },
    ]);

    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        "http://127.0.0.1:8000/api/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: texto,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.error || "Erro ao conversar com o servidor."
        );
      }

      // Adiciona a resposta do Django
      setMensagens((anteriores) => [
        ...anteriores,
        {
          tipo: "bot",
          texto: dados.response,
        },
      ]);
    } catch (erro) {
      console.error("Erro no chatbot:", erro);

      setMensagens((anteriores) => [
        ...anteriores,
        {
          tipo: "bot",
          texto: "Não consegui me conectar ao servidor.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      {!aberto && (
        <button
          className="chatbot-botao"
          onClick={() => setAberto(true)}
        >
          💬
        </button>
      )}

      {aberto && (
        <div className="chatbot">

          <div className="chatbot-header">
            <div>
              <strong>VidaSUS</strong>
              <span>Assistente virtual</span>
            </div>

            <button
              className="chatbot-fechar"
              onClick={() => setAberto(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot-mensagens">

            {mensagens.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-mensagem ${msg.tipo}`}
              >
                {msg.texto}
              </div>
            ))}

            {carregando && (
              <div className="chatbot-mensagem bot">
                Digitando...
              </div>
            )}

          </div>

          <form
            className="chatbot-form"
            onSubmit={enviarMensagem}
          >
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              disabled={carregando}
            />

            <button
              type="submit"
              disabled={carregando}
            >
              ➤
            </button>
          </form>

        </div>
      )}
    </>
  );
}