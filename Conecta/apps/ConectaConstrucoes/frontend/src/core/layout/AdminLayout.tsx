import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import HeaderChatButton from '../../components/chat/HeaderChatButton'
import { useSession } from '../../context/SessionContext'
import AccountTrigger from '../../components/session/AccountTrigger'

const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'users' },
  { to: '/admin/documentos', label: 'Documentos', icon: 'file' },
  { to: '/admin/denuncias', label: 'Denúncias', icon: 'flag' },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { usuario, sair } = useSession()
  const navigate = useNavigate()
  return (
    <div className="shell">
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Icon name="shield" size={18} /></span> Conecta <small>Admin</small></div>
        <nav aria-label="Menu administrativo">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}>
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="sidebar-foot" onClick={() => { sair(); navigate('/login', { replace: true }) }}><Icon name="logout" /> Sair</button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Abrir menu"><Icon name="menu" size={22} /></button>
          <span className="topbar-title">Painel Administrativo</span>
          <div className="topbar-right">
            <HeaderChatButton />
            <button type="button" className="icon-btn" aria-label="Notificações"><Icon name="bell" /></button>
            <AccountTrigger className="avatar" title="Minha conta">{usuario?.nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase() ?? 'AD'}</AccountTrigger>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
