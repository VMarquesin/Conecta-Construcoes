import { Link, useParams } from 'react-router-dom'
import { Card, ErrorState, PageHeader, Spinner } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'
import BlockUserButton from '../../features/admin/components/BlockUserButton'
import { StatusUsuarioBadge, TipoUsuarioBadge } from '../../features/admin/components/Badges'
import { formatDateTime, initials } from '../../features/admin/format'

export default function UsuarioDetalhe() {
  const { id = '' } = useParams()
  const { data: u, setData, loading, error, reload } = useAsync(() => adminService.obterUsuario(id), [id])
  const { data: roles } = useAsync(() => adminService.listarRoles(), [])

  if (loading && !u) return <Spinner />
  if (error || !u) return <ErrorState message={error ?? 'Usuário não encontrado'} onRetry={reload} />

  const nomesRoles = roles?.filter((r) => u.roles.includes(r.id)) ?? []
  const permissoes = [...new Set(nomesRoles.flatMap((r) => r.permissoes))]

  return (
    <>
      <Link to="/admin/usuarios" className="back"><Icon name="back" size={16} /> Voltar para usuários</Link>
      <PageHeader title={u.nome} subtitle={u.email}
        actions={<>
          <Link className="btn" to={`/admin/usuarios/${u.id}/editar`}><Icon name="edit" size={16} /> Editar</Link>
          <Link className="btn" to={`/admin/usuarios/${u.id}/roles`}><Icon name="key" size={16} /> Roles</Link>
          <BlockUserButton usuario={u} onChange={setData} />
        </>} />

      <div className="grid-2">
        <Card title="Dados do usuário">
          <div className="profile">
            <span className="avatar lg">{initials(u.nome)}</span>
            <div><TipoUsuarioBadge tipo={u.tipo} /> <StatusUsuarioBadge status={u.status} /></div>
          </div>
          <dl className="details">
            <dt>Nome</dt><dd>{u.nome}</dd>
            <dt>E-mail</dt><dd>{u.email}</dd>
            <dt>Telefone</dt><dd>{u.telefone}</dd>
            <dt>Cidade</dt><dd>{u.cidade}</dd>
            <dt>Cadastro</dt><dd>{formatDateTime(u.criadoEm)}</dd>
          </dl>
        </Card>

        <Card title="Papéis e permissões" actions={<Link className="link" to={`/admin/usuarios/${u.id}/roles`}>Gerenciar</Link>}>
          <div className="chips">{nomesRoles.length ? nomesRoles.map((r) => <span key={r.id} className="chip">{r.nome}</span>) : <span className="muted">Sem roles atribuídas</span>}</div>
          <h3 className="sub">Permissões efetivas</h3>
          <div className="perms">{permissoes.length ? permissoes.map((p) => <code key={p}>{p}</code>) : <span className="muted">Nenhuma</span>}</div>
        </Card>
      </div>
    </>
  )
}
