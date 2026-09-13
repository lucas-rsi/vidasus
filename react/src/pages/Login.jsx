import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const MAX_TENTATIVAS = 3;
const BLOQUEIO_SEGUNDOS = 30;

export default function Login() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erroCpf, setErroCpf] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroApi, setErroApi] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (!bloqueado) return;
    const timer = setTimeout(() => {
      setBloqueado(false);
      setTentativas(0);
      setErroApi("");
    }, BLOQUEIO_SEGUNDOS * 1000);
    return () => clearTimeout(timer);
  }, [bloqueado]);

  function validar() {
    let valido = true;

    if (!cpf.trim()) {
      setErroCpf("CPF é obrigatório.");
      valido = false;
    } else if (!/^\d+$/.test(cpf)) {
      setErroCpf("CPF deve conter apenas números.");
      valido = false;
    } else if (cpf.length !== 11) {
      setErroCpf("CPF deve ter exatamente 11 dígitos.");
      valido = false;
    } else {
      setErroCpf("");
    }

    if (!senha) {
      setErroSenha("Senha é obrigatória.");
      valido = false;
    } else if (senha.length < 3) {
      setErroSenha("Senha deve ter no mínimo 3 caracteres.");
      valido = false;
    } else {
      setErroSenha("");
    }

    return valido;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (bloqueado) return;

    setErroApi("");

    if (!validar()) return;

    setCarregando(true);
    try {
      const usuario = await loginUsuario(cpf, senha);
      setTentativas(0);
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
      navigate(usuario.tipo === "GESTOR" ? "/dashboard" : "/agendamentos");
    } catch {
      const novasTentativas = tentativas + 1;
      setTentativas(novasTentativas);
      setSenha("");

      if (novasTentativas >= MAX_TENTATIVAS) {
        setBloqueado(true);
        setErroApi(
          `Acesso bloqueado. Tente novamente em ${BLOQUEIO_SEGUNDOS} segundos.`
        );
      } else {
        const restantes = MAX_TENTATIVAS - novasTentativas;
        setErroApi(
          `CPF ou senha incorretos. ${restantes} ${
            restantes === 1 ? "tentativa restante" : "tentativas restantes"
          }.`
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <h1>
            Vida<span>SUS</span>
          </h1>
          <p>Sistema Inteligente de Agendamento em Saúde Pública</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              placeholder="Digite seu CPF"
              maxLength={11}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={bloqueado}
            />
            {erroCpf && <div className="erro-campo">{erroCpf}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={bloqueado}
            />
            {erroSenha && <div className="erro-campo">{erroSenha}</div>}
          </div>

          {carregando ? (
            <LoadingSpinner />
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={bloqueado}
            >
              Entrar
            </button>
          )}

          {erroApi && <div className="msg-erro show">{erroApi}</div>}
        </form>

        <p className="login-hint">Cidadão: 12345678900 / 123</p>
        <p className="login-hint">Gestor: 00000000000 / admin</p>
      </div>
    </div>
  );
}
