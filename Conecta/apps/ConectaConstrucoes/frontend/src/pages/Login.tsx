import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CONTAS_DEMO, PERFIL_INFO, useSession } from '../context/SessionContext'
import './Login.css'

export default function Login() {
  const { usuario, perfilAtivo, entrar } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  if (usuario && perfilAtivo) return <Navigate to={PERFIL_INFO[perfilAtivo].home} replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Autenticação simulada: será substituída pelo POST /auth/login do backend.
    const conta = CONTAS_DEMO.find((c) => c.email.toLowerCase() === email.trim().toLowerCase())
    if (!conta || !senha) {
      setErro('E-mail ou senha inválidos.')
      return
    }
    const perfil = conta.perfis[0]
    entrar(conta, perfil)
    navigate(PERFIL_INFO[perfil].home, { replace: true })
  }

  return (
    <div className="login-viewport">
      <main className="login-card">
        <div className="login-brand">
          <span className="login-logo">C</span>
          <h1>Conecta Construções</h1>
          <p>Entre para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErro('') }}
              required
            />
          </label>

          <label className="login-field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro('') }}
              required
            />
          </label>

          {erro && <div className="login-error" role="alert">{erro}</div>}

          <button type="submit" className="login-btn login-submit">Entrar</button>
        </form>
      </main>
    </div>
  )
}
