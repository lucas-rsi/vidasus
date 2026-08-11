import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAgendamentos,
  getExames,
  criarAgendamento,
  cancelarAgendamento,
  ESPECIALIDADES,
} from "../api/client";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function formatarData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function hojeISO() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function Agendamentos() {
  const navigate = useNavigate();
  const [usuario] = useState(() => {
    const raw = sessionStorage.getItem("usuario");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u.tipo === "CIDADAO" ? u : null;
  });
  const [aba, setAba] = useState("agendamentos");

  // ── Agendamentos ──
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregandoAg, setCarregandoAg] = useState(true);
  const [erroAg, setErroAg] = useState("");

  // ── Histórico ──
  const [exames, setExames] = useState([]);
  const [carregandoExames, setCarregandoExames] = useState(true);
  const [erroExames, setErroExames] = useState("");

  // ── Formulário novo agendamento ──
  const [formAberto, setFormAberto] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [novaEspecialidade, setNovaEspecialidade] = useState(ESPECIALIDADES[0]);
  const [erroData, setErroData] = useState("");
  const [erroHorario, setErroHorario] = useState("");
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [sucessoSalvar, setSucessoSalvar] = useState("");

  // ── Cancelamento por linha ──
  const [cancelandoId, setCancelandoId] = useState(null);

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [usuario, navigate]);

  useEffect(() => {
    if (!usuario) return;

    getAgendamentos(usuario.cpf)
      .then((dados) => {
        setAgendamentos(dados);
        setErroAg("");
      })
      .catch(() => setErroAg("Não foi possível carregar os agendamentos."))
      .finally(() => setCarregandoAg(false));

    getExames(usuario.cpf)
      .then((dados) => {
        setExames(dados);
        setErroExames("");
      })
      .catch(() => setErroExames("Não foi possível carregar o histórico."))
      .finally(() => setCarregandoExames(false));
  }, [usuario]);

  function handleSair() {
    sessionStorage.removeItem("usuario");
    navigate("/login");
  }

  function validarNovoAg() {
    let valido = true;

    if (!novaData) {
      setErroData("Data é obrigatória.");
      valido = false;
    } else if (novaData < hojeISO()) {
      setErroData("A data não pode estar no passado.");
      valido = false;
    } else {
      setErroData("");
    }

    if (!novoHorario) {
      setErroHorario("Horário é obrigatório.");
      valido = false;
    } else {
      setErroHorario("");
    }

    return valido;
  }

  async function handleConfirmarNovoAg() {
    setErroSalvar("");
    setSucessoSalvar("");
    if (!validarNovoAg()) return;

    setSalvandoNovo(true);
    try {
      const novo = await criarAgendamento({
        cidadao: usuario.nome,
        cpf: usuario.cpf,
        data: novaData,
        horario: novoHorario,
        especialidade: novaEspecialidade,
      });
      setAgendamentos((prev) => [...prev, novo]);
      setSucessoSalvar("Agendamento criado com sucesso!");
      setNovaData("");
      setNovoHorario("");
      setNovaEspecialidade(ESPECIALIDADES[0]);
      setFormAberto(false);
    } catch {
      setErroSalvar("Não foi possível criar o agendamento. Tente novamente.");
    } finally {
      setSalvandoNovo(false);
    }
  }

  function handleFecharForm() {
    setFormAberto(false);
    setErroData("");
    setErroHorario("");
    setErroSalvar("");
  }

  async function handleCancelar(id) {
    setCancelandoId(id);
    try {
      await cancelarAgendamento(id);
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelado" } : a))
      );
    } catch {
      setErroAg("Não foi possível cancelar o agendamento.");
    } finally {
      setCancelandoId(null);
    }
  }

  if (!usuario) return null;

  return (
    <div className="page">
      <Header titulo="VidaSUS" usuario={usuario.nome} onSair={handleSair} />

      <main className="container">
        <div className="tabs">
          <button
            className={`tab-btn ${aba === "agendamentos" ? "active" : ""}`}
            onClick={() => setAba("agendamentos")}
          >
            Meus Agendamentos
          </button>
          <button
            className={`tab-btn ${aba === "historico" ? "active" : ""}`}
            onClick={() => setAba("historico")}
          >
            Meu Histórico
          </button>
        </div>

        {aba === "agendamentos" && (
          <div className="card">
            <div className="card-header-row">
              <span className="card-title">Agendamentos</span>
              <button
                className="btn btn-primary"
                onClick={() => setFormAberto((v) => !v)}
              >
                + Novo Agendamento
              </button>
            </div>

            {formAberto && (
              <div className="inline-form open">
                <div className="form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={novaData}
                      onChange={(e) => setNovaData(e.target.value)}
                    />
                    {erroData && <div className="erro-campo">{erroData}</div>}
                  </div>
                  <div className="form-group">
                    <label>Horário</label>
                    <input
                      type="time"
                      value={novoHorario}
                      onChange={(e) => setNovoHorario(e.target.value)}
                    />
                    {erroHorario && <div className="erro-campo">{erroHorario}</div>}
                  </div>
                  <div className="form-group">
                    <label>Especialidade</label>
                    <select
                      value={novaEspecialidade}
                      onChange={(e) => setNovaEspecialidade(e.target.value)}
                    >
                      {ESPECIALIDADES.map((esp) => (
                        <option key={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {salvandoNovo ? (
                  <LoadingSpinner />
                ) : (
                  <div className="form-actions">
                    <button className="btn btn-success" onClick={handleConfirmarNovoAg}>
                      Confirmar
                    </button>
                    <button className="btn btn-secondary" onClick={handleFecharForm}>
                      Cancelar
                    </button>
                  </div>
                )}

                {erroSalvar && <div className="msg-erro show">{erroSalvar}</div>}
              </div>
            )}

            {sucessoSalvar && <div className="msg-sucesso show">{sucessoSalvar}</div>}

            {carregandoAg ? (
              <LoadingSpinner />
            ) : erroAg ? (
              <div className="msg-erro show">{erroAg}</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Especialidade</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="vazio">
                          Nenhum agendamento encontrado.
                        </td>
                      </tr>
                    ) : (
                      agendamentos.map((ag) => (
                        <tr key={ag.id}>
                          <td>{formatarData(ag.data)}</td>
                          <td>{ag.horario}</td>
                          <td>{ag.especialidade}</td>
                          <td>
                            <StatusBadge status={ag.status} />
                          </td>
                          <td>
                            {ag.status === "Pendente" ? (
                              cancelandoId === ag.id ? (
                                <LoadingSpinner />
                              ) : (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleCancelar(ag.id)}
                                >
                                  Cancelar
                                </button>
                              )
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {aba === "historico" && (
          <div className="card">
            <div className="card-title">Histórico de Exames</div>

            {carregandoExames ? (
              <LoadingSpinner />
            ) : erroExames ? (
              <div className="msg-erro show">{erroExames}</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Resultado</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exames.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.tipo}</td>
                        <td>{e.resultado}</td>
                        <td>{formatarData(e.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
