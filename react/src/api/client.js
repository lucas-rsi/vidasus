// ── DADOS MOCKADOS ──────────────────────────────────────────
const CIDADAOS = [
  { nome: "João Silva", cpf: "12345678900", cartaoSUS: "SUS123", senha: "123" },
  { nome: "Maria Souza", cpf: "98765432100", cartaoSUS: "SUS456", senha: "123" },
];

const GESTOR = { nome: "Dr. Carlos", cpf: "00000000000", senha: "admin", tipo: "GESTOR" };

let AGENDAMENTOS = [
  { id: 1, cidadao: "João Silva", cpf: "12345678900", data: "2025-05-20", horario: "09:00", especialidade: "Cardiologia", status: "Confirmado" },
  { id: 2, cidadao: "João Silva", cpf: "12345678900", data: "2025-05-22", horario: "14:00", especialidade: "Clínico Geral", status: "Pendente" },
  { id: 3, cidadao: "Maria Souza", cpf: "98765432100", data: "2025-05-21", horario: "10:30", especialidade: "Pediatria", status: "Cancelado" },
  { id: 4, cidadao: "Maria Souza", cpf: "98765432100", data: "2025-05-23", horario: "08:00", especialidade: "Ortopedia", status: "Confirmado" },
  { id: 5, cidadao: "João Silva", cpf: "12345678900", data: "2025-05-25", horario: "11:00", especialidade: "Dermatologia", status: "Pendente" },
];

const HISTORICO_EXAMES = [
  { tipo: "Hemograma Completo", resultado: "Normal", data: "2025-03-10" },
  { tipo: "Glicemia em Jejum", resultado: "108 mg/dL (limítrofe)", data: "2025-03-10" },
  { tipo: "Raio-X Tórax", resultado: "Sem alterações", data: "2025-04-02" },
  { tipo: "Eletrocardiograma", resultado: "Ritmo sinusal", data: "2025-04-15" },
];

export const ESPECIALIDADES = ["Clínico Geral", "Cardiologia", "Pediatria", "Ortopedia", "Dermatologia"];

// ── SIMULAÇÃO DE API ────────────────────────────────────────
const fakeRequest = (data, shouldFail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (shouldFail) reject(new Error("Erro ao conectar com o servidor."));
      else resolve(data);
    }, 800)
  );

export const loginUsuario = (cpf, senha) => {
  if (cpf === GESTOR.cpf && senha === GESTOR.senha) {
    return fakeRequest({ nome: GESTOR.nome, cpf: GESTOR.cpf, tipo: "GESTOR" });
  }
  const cidadao = CIDADAOS.find((c) => c.cpf === cpf && c.senha === senha);
  if (cidadao) {
    return fakeRequest({
      nome: cidadao.nome,
      cpf: cidadao.cpf,
      cartaoSUS: cidadao.cartaoSUS,
      tipo: "CIDADAO",
    });
  }
  return fakeRequest(null, true);
};

export const getAgendamentos = (cpf) =>
  fakeRequest(AGENDAMENTOS.filter((a) => a.cpf === cpf).map((a) => ({ ...a })));

export const getExames = () => fakeRequest(HISTORICO_EXAMES.map((e) => ({ ...e })));

export const criarAgendamento = (dados) => {
  const novo = {
    id: Date.now(),
    cidadao: dados.cidadao,
    cpf: dados.cpf,
    data: dados.data,
    horario: dados.horario,
    especialidade: dados.especialidade,
    status: "Pendente",
  };
  AGENDAMENTOS.push(novo);
  return fakeRequest({ ...novo });
};

export const cancelarAgendamento = (id) => {
  const ag = AGENDAMENTOS.find((a) => a.id === id);
  if (!ag) return fakeRequest(null, true);
  ag.status = "Cancelado";
  return fakeRequest({ ...ag });
};

export const getDashboardStats = () => {
  const total = AGENDAMENTOS.length;
  const confirmados = AGENDAMENTOS.filter((a) => a.status === "Confirmado").length;
  const cancelados = AGENDAMENTOS.filter((a) => a.status === "Cancelado").length;
  const pendentes = AGENDAMENTOS.filter((a) => a.status === "Pendente").length;
  const taxaNoShow = total > 0 ? (cancelados / total) * 100 : 0;

  const porEspecialidade = {};
  AGENDAMENTOS.forEach((a) => {
    porEspecialidade[a.especialidade] = (porEspecialidade[a.especialidade] || 0) + 1;
  });

  return fakeRequest({
    total,
    confirmados,
    cancelados,
    pendentes,
    taxaNoShow,
    porEspecialidade,
    agendamentos: AGENDAMENTOS.map((a) => ({ ...a })),
  });
};
