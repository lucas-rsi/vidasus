const CORES = {
  Confirmado: "badge-verde",
  Pendente: "badge-amarelo",
  Cancelado: "badge-vermelho",
};

export default function StatusBadge({ status }) {
  const classe = CORES[status] || "badge-amarelo";
  return <span className={`badge ${classe}`}>{status}</span>;
}
