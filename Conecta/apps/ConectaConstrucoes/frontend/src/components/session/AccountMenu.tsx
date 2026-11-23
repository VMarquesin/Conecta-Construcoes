import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERFIL_INFO, useSession, type Perfil } from '../../context/SessionContext'
import './AccountMenu.css'

const ORDEM: Perfil[] = ['CLIENTE', 'PRESTADOR', 'ADMIN']

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

/** Menu único de conta: perfil atual, troca de modo de visualização e sair. Renderizado uma vez na raiz do app. */
export default function AccountMenu() {
  const { usuario, perfilAtivo, menuContaAberto, fecharMenuConta, trocarPerfil, sair } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!menuContaAberto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && fecharMenuConta()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuContaAberto, fecharMenuConta])

  if (!usuario || !perfilAtivo || !menuContaAberto) return null

  const perfis = ORDEM.filter((p) => usuario.perfis.includes(p))

  const escolher = (p: Perfil) => {
    fecharMenuConta()
    if (p === perfilAtivo) return
    trocarPerfil(p)
    navigate(PERFIL_INFO[p].home, { replace: true })
  }

  const handleSair = () => {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="account-scrim" onClick={fecharMenuConta} />
      <div className="account-panel" role="dialog" aria-label="Menu da conta">
        <div className="account-head">
          <span className="account-avatar">{iniciais(usuario.nome)}</span>
          <div className="account-head-text">
            <strong>{usuario.nome}</strong>
            <span>{usuario.email}</span>
          </div>
        </div>

        <div className="account-section-title">
          {perfis.length > 1 ? 'Alternar modo de visualização' : 'Seu perfil'}
        </div>
        <ul className="account-profiles">
          {perfis.map((p) => (
            <li key={p}>
              <button
                type="button"
                className={`account-profile-item${p === perfilAtivo ? ' active' : ''}`}
                onClick={() => escolher(p)}
                aria-current={p === perfilAtivo}
              >
                <span className="account-profile-radio" />
                <span className="account-profile-text">
                  <strong>{PERFIL_INFO[p].label}</strong>
                  <small>{PERFIL_INFO[p].descricao}</small>
                </span>
                {p === perfilAtivo && <span className="account-profile-current">Atual</span>}
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="account-logout" onClick={handleSair}>
          Sair da conta
        </button>
      </div>
    </>
  )
}
