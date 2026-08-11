export default function KpiCard({ titulo, valor, cor }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: cor }}>
      <div className="kpi-valor">{valor}</div>
      <div className="kpi-titulo">{titulo}</div>
    </div>
  );
}
