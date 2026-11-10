import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type Perfil = 'CLIENTE' | 'PRESTADOR' | 'ADMIN'

export interface UsuarioSessao {
  id: string
  nome: string
  email: string
  perfis: Perfil[]
  fotoPerfilUrl?: string
}

export const PERFIL_INFO: Record<Perfil, { label: string; descricao: string; home: string }> = {
  CLIENTE: { label: 'Cliente', descricao: 'Contratar e acompanhar serviços', home: '/' },
  PRESTADOR: { label: 'Prestador', descricao: 'Receber pedidos e gerir portfólio', home: '/pro' },
  ADMIN: { label: 'Administrador', descricao: 'Gestão da plataforma', home: '/admin' },
}

interface SessionState {
  usuario: UsuarioSessao | null
  perfilAtivo: Perfil | null
}

interface SessionContextValue extends SessionState {
  menuContaAberto: boolean
  abrirMenuConta: () => void
  fecharMenuConta: () => void
  entrar: (usuario: UsuarioSessao, perfil: Perfil) => void
  trocarPerfil: (perfil: Perfil) => void
  sair: () => void
}

const STORAGE_KEY = 'conecta.sessao'

function carregar(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { usuario: null, perfilAtivo: null }
    const parsed = JSON.parse(raw) as SessionState
    if (parsed.usuario && parsed.perfilAtivo && parsed.usuario.perfis.includes(parsed.perfilAtivo)) return parsed
  } catch {
    /* sessão inválida: ignora */
  }
  return { usuario: null, perfilAtivo: null }
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(carregar)
  const [menuContaAberto, setMenuContaAberto] = useState(false)

  const persistir = (next: SessionState) => {
    setState(next)
    if (next.usuario) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const entrar = useCallback((usuario: UsuarioSessao, perfil: Perfil) => {
    persistir({ usuario, perfilAtivo: perfil })
  }, [])

  const trocarPerfil = useCallback((perfil: Perfil) => {
    setState((prev) => {
      if (!prev.usuario || !prev.usuario.perfis.includes(perfil)) return prev
      const next = { ...prev, perfilAtivo: perfil }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const sair = useCallback(() => {
    persistir({ usuario: null, perfilAtivo: null })
    localStorage.removeItem('conecta.token')
    setMenuContaAberto(false)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      menuContaAberto,
      abrirMenuConta: () => setMenuContaAberto(true),
      fecharMenuConta: () => setMenuContaAberto(false),
      entrar,
      trocarPerfil,
      sair,
    }),
    [state, menuContaAberto, entrar, trocarPerfil, sair],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession deve ser usado dentro de SessionProvider')
  return ctx
}
