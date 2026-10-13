import { Link, useParams } from 'react-router-dom'
import { ErrorState, PageHeader, Spinner } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'
import RoleManager from '../../features/admin/components/RoleManager'

export default function UsuarioRoles() {
  const { id = '' } = useParams()
  const { data: u, setData, loading, error, reload } = useAsync(() => adminService.obterUsuario(id), [id])
  const { data: roles } = useAsync(() => adminService.listarRoles(), [])

  if (loading && !u) return <Spinner />
  if (error || !u) return <ErrorState message={error ?? 'Usuário não encontrado'} onRetry={reload} />

  return (
    <>
      <Link to={`/admin/usuarios/${id}`} className="back"><Icon name="back" size={16} /> Voltar</Link>
      <PageHeader title="Atribuir roles" subtitle={`${u.nome} · ${u.email}`} />
      {roles ? <RoleManager usuario={u} roles={roles} onChange={setData} /> : <Spinner />}
    </>
  )
}
