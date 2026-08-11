import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats } from "../api/client";
import Header from "../components/Header";
import KpiCard from "../components/KpiCard";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function formatarData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario] = useState(() => {
    const raw = sessionStorage.getItem("usuario");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u.tipo === "GESTOR" ? u : null;
  });
  const [stats, setStats] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [usuario, navigate]);

  useEffect(() => {
    if (!usuario) return;

    getDashboardStats()
      .then((dados) => {
        setStats(dados);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar os dados do painel."))
      .finally(() => setCarregando(false));
  }, [usuario]);

  function handleSair() {
    sessionStorage.removeItem("usuario");
    navigate("/login");
  }

  if (!usuario) return null;

  const dadosGrafico = stats
    ? Object.entries(stats.porEspecialidade).map(([especialidade, total]) => ({
        especialidade,
        total,
      }))
    : [];

  const agendamentosOrdenados = stats
    ? [...stats.agendamentos].sort((a, b) => a.data.localeCompare(b.data))
    : [];

  return (
    <div className="page">
      <Header titulo="VidaSUS – Painel do Gestor" usuario={usuario.nome} onSair={handleSair} />

      <main className="container">
        {carregando ? (
          <LoadingSpinner />
        ) : erro ? (
          <div className="msg-erro show">{erro}</div>
        ) : (
          <>
            <div className="kpi-grid">
              <KpiCard titulo="Total de Agendamentos" valor={stats.total} cor="#2E86C1" />
              <KpiCard titulo="Confirmados" valor={stats.confirmados} cor="#1E8449" />
              <KpiCard titulo="Cancelados" valor={stats.cancelados} cor="#C0392B" />
              <KpiCard
                titulo="Taxa de No-Show"
                valor={`${stats.taxaNoShow.toFixed(1)}%`}
                cor="#D4AC0D"
              />
            </div>

            <div className="card">
              <div className="card-title">Agendamentos por Especialidade</div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c3e54" />
                    <XAxis dataKey="especialidade" stroke="#e0e0e0" />
                    <YAxis allowDecimals={false} stroke="#e0e0e0" />
                    <Tooltip
                      contentStyle={{ background: "#1a2f4a", border: "1px solid #2E86C1" }}
                      labelStyle={{ color: "#e0e0e0" }}
                    />
                    <Bar dataKey="total" fill="#2E86C1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Todos os Agendamentos</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cidadão</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Especialidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentosOrdenados.map((ag) => (
                      <tr key={ag.id}>
                        <td>{ag.cidadao}</td>
                        <td>{formatarData(ag.data)}</td>
                        <td>{ag.horario}</td>
                        <td>{ag.especialidade}</td>
                        <td>
                          <StatusBadge status={ag.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
