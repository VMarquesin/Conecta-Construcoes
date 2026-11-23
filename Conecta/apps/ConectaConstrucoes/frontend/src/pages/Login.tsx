import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PERFIL_INFO, useSession, type Perfil, type UsuarioSessao } from '../context/SessionContext'
import { http, ApiError } from '../core/api/http'
import './Login.css'

interface LoginApiResponse {
  token: string
  expiracao: string
  usuario: {
    id: number
    nome: string
    email: string
    tipo?: string
    roles: string[]
  }
  permissoes: string[]
}

export default function Login() {
  const { usuario, perfilAtivo, entrar } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  if (usuario && perfilAtivo) return <Navigate to={PERFIL_INFO[perfilAtivo].home} replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }

    try {
      setCarregando(true)
      setErro('')

      const res = await http<LoginApiResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), senha }),
      })

      localStorage.setItem('conecta.token', res.token)

      const roles = res.usuario.roles || []
      const perfis: Perfil[] = []
      if (roles.includes('ADMIN_MASTER') || roles.includes('ADMIN')) perfis.push('ADMIN')
      if (roles.includes('PRESTADOR')) perfis.push('PRESTADOR')
      if (roles.includes('CLIENTE')) perfis.push('CLIENTE')

      if (perfis.length === 0) {
        perfis.push('CLIENTE')
      }

      const perfilPadrao = perfis[0]

      const usuarioSessao: UsuarioSessao = {
        id: String(res.usuario.id),
        nome: res.usuario.nome,
        email: res.usuario.email,
        perfis,
      }

      entrar(usuarioSessao, perfilPadrao)
      navigate(PERFIL_INFO[perfilPadrao].home, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        try {
          const parsed = JSON.parse(err.message)
          setErro(parsed.mensagem || 'E-mail ou senha inválidos.')
        } catch {
          setErro(err.message || 'E-mail ou senha inválidos.')
        }
      } else {
        setErro('Falha na comunicação com o servidor. Verifique se o backend está ativo.')
      }
    } finally {
      setCarregando(false)
    }
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

          <button type="submit" className="login-btn login-submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Cadastre-se aqui
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
