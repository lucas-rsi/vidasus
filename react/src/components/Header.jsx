export default function Header({ titulo, usuario, onSair }) {
  return (
    <header className="header">
      <span className="header-titulo">{titulo}</span>
      <nav className="header-nav">
        <span className="header-usuario">{usuario}</span>
        <button className="btn-sair" onClick={onSair}>
          Sair
        </button>
      </nav>
    </header>
  );
}
