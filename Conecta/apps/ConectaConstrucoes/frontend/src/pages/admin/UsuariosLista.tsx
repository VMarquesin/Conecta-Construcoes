import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'
import { StatusUsuarioBadge, TipoUsuarioBadge } from '../../features/admin/components/Badges'
import { formatDate, initials } from '../../features/admin/format'
import type { FiltroUsuarios, StatusUsuario, TipoUsuario } from '../../features/admin/types'

export default function UsuariosLista() {
  const [params, setParams] = useSearchParams()
  const filtro: FiltroUsuarios = {
    busca: params.get('busca') ?? '',
    tipo: (params.get('tipo') ?? '') as TipoUsuario | '',
    status: (params.get('status') ?? '') as StatusUsuario | '',
    de: params.get('de') ?? '',
    ate: params.get('ate') ?? '',
  }
  const { data, loading, error, reload } = useAsync(() => adminService.listarUsuarios(filtro), [params.toString()])

  const set = (k: keyof FiltroUsuarios, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v); else p.delete(k)
    setParams(p, { replace: true })
  }
  const hasFilter = [...params.keys()].length > 0

  return (
    <>
      <PageHeader title="Usuários" subtitle="Gerencie contas, status e papéis" />

      <div className="filters">
        <label className="search">
          <Icon name="search" />
          <input type="search" placeholder="Buscar por nome ou e-mail" value={filtro.busca} onChange={(e) => set('busca', e.target.value)} />
        </label>
        <select aria-label="Tipo" value={filtro.tipo} onChange={(e) => set('tipo', e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="CLIENTE">Cliente</option>
          <option value="PRESTADOR">Prestador</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select aria-label="Status" value={filtro.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="PENDENTE">Pendente</option>
          <option value="BLOQUEADO">Bloqueado</option>
        </select>
        <label className="date">De <input type="date" value={filtro.de} onChange={(e) => set('de', e.target.value)} /></label>
        <label className="date">Até <input type="date" value={filtro.ate} onChange={(e) => set('ate', e.target.value)} /></label>
        {hasFilter && <button type="button" className="btn" onClick={() => setParams({})}>Limpar</button>}
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Nenhum usuário encontrado" text="Ajuste os filtros para ampliar a busca." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table responsive">
            <thead><tr><th>Usuário</th><th>Tipo</th><th>Status</th><th>Cadastro</th><th aria-label="Ações" /></tr></thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td data-label="Usuário">
                    <Link to={`/admin/usuarios/${u.id}`} className="user-cell">
                      <span className="avatar sm">{initials(u.nome)}</span>
                      <span><strong>{u.nome}</strong><small className="muted">{u.email}</small></span>
                    </Link>
                  </td>
                  <td data-label="Tipo"><TipoUsuarioBadge tipo={u.tipo} /></td>
                  <td data-label="Status"><StatusUsuarioBadge status={u.status} /></td>
                  <td data-label="Cadastro">{formatDate(u.criadoEm)}</td>
                  <td className="row-actions">
                    <Link className="btn sm" to={`/admin/usuarios/${u.id}`}><Icon name="eye" size={15} /> Detalhes</Link>
                    <Link className="btn sm" to={`/admin/usuarios/${u.id}/roles`}><Icon name="key" size={15} /> Roles</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
