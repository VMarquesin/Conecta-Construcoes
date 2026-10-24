import { Navigate, Outlet } from 'react-router-dom'
import { PERFIL_INFO, useSession, type Perfil } from '../../context/SessionContext'

/** Guarda de rota: só renderiza se o perfil ATIVO for o exigido. Caso contrário, redireciona. */
export default function RequirePerfil({ perfil }: { perfil: Perfil }) {
  const { usuario, perfilAtivo } = useSession()
  if (!usuario || !perfilAtivo) return <Navigate to="/login" replace />
  if (perfilAtivo !== perfil) return <Navigate to={PERFIL_INFO[perfilAtivo].home} replace />
  return <Outlet />
}
