// ── API REAL ────────────────────────────────────────────────
const API_URL = "http://127.0.0.1:8000";

export const ESPECIALIDADES = [
  "Clínico Geral",
  "Cardiologia",
  "Pediatria",
  "Ortopedia",
  "Dermatologia",
];

async function request(caminho, opcoes = {}) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
    });
  } catch {
    throw new Error("Erro ao conectar com o servidor.");
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(dados?.error || "Erro ao conectar com o servidor.");
  }

  return dados;
}

export const loginUsuario = (cpf, senha) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ cpf, senha }),
  });

export const getAgendamentos = (cpf) =>
  request(`/api/agendamentos?cpf=${encodeURIComponent(cpf)}`);

export const getExames = (cpf) =>
  request(`/api/exames?cpf=${encodeURIComponent(cpf)}`);

export const criarAgendamento = (dados) =>
  request("/api/agendamentos", {
    method: "POST",
    body: JSON.stringify({
      cpf: dados.cpf,
      data: dados.data,
      horario: dados.horario,
      especialidade: dados.especialidade,
    }),
  });

export const cancelarAgendamento = (id) =>
  request(`/api/agendamentos/${id}/cancelar`, { method: "PATCH" });

export const getDashboardStats = () => request("/api/dashboard/stats");
