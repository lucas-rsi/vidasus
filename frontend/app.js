'use strict';

const CIDADAOS = [
  { nome: "João Silva",  cpf: "12345678900", cartaoSUS: "SUS123", senha: "123" },
  { nome: "Maria Souza", cpf: "98765432100", cartaoSUS: "SUS456", senha: "123" }
];

const GESTOR = { nome: "Dr. Carlos", cpf: "00000000000", senha: "admin" };

const AGENDAMENTOS = [
  { id: 1, cidadao: "João Silva",  data: "2025-05-20", horario: "09:00", especialidade: "Cardiologia",   status: "Confirmado" },
  { id: 2, cidadao: "João Silva",  data: "2025-05-22", horario: "14:00", especialidade: "Clínico Geral", status: "Pendente"   },
  { id: 3, cidadao: "Maria Souza", data: "2025-05-21", horario: "10:30", especialidade: "Pediatria",     status: "Cancelado"  },
  { id: 4, cidadao: "Maria Souza", data: "2025-05-23", horario: "08:00", especialidade: "Ortopedia",     status: "Confirmado" },
  { id: 5, cidadao: "João Silva",  data: "2025-05-25", horario: "11:00", especialidade: "Dermatologia",  status: "Pendente"   },
];

const HISTORICO_EXAMES = [
  { tipo: "Hemograma Completo", resultado: "Normal",            data: "2025-03-10" },
  { tipo: "Glicemia em Jejum",  resultado: "108 mg/dL (limítrofe)", data: "2025-03-10" },
  { tipo: "Raio-X Tórax",       resultado: "Sem alterações",    data: "2025-04-02" },
  { tipo: "Eletrocardiograma",  resultado: "Ritmo sinusal",     data: "2025-04-15" },
];

const ESPECIALIDADES = ["Clínico Geral", "Cardiologia", "Pediatria", "Ortopedia", "Dermatologia"];

function badgeHtml(text, cor) {
  return `<span class="badge badge-${cor}">${text}</span>`;
}

function statusBadge(status) {
  const cor = { "Confirmado": "green", "Pendente": "yellow", "Cancelado": "red" }[status] || "yellow";
  return badgeHtml(status, cor);
}

function login(cpf, senha) {
  if (cpf === GESTOR.cpf && senha === GESTOR.senha) {
    sessionStorage.setItem('usuario', JSON.stringify({ tipo: 'gestor', ...GESTOR }));
    return { ok: true, destino: 'dashboard.html' };
  }
  const cidadao = CIDADAOS.find(c => c.cpf === cpf && c.senha === senha);
  if (cidadao) {
    sessionStorage.setItem('usuario', JSON.stringify({ tipo: 'cidadao', ...cidadao }));
    return { ok: true, destino: 'agendamentos.html' };
  }
  return { ok: false };
}

function getUsuario() {
  const raw = sessionStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  sessionStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function exigirLogin(tipoEsperado) {
  const u = getUsuario();
  if (!u) { window.location.href = 'index.html'; return null; }
  if (tipoEsperado && u.tipo !== tipoEsperado) { window.location.href = 'index.html'; return null; }
  return u;
}
