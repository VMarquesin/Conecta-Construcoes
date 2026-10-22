import { useState } from 'react'
import { Card, ConfirmDialog } from '../../../core/components/ui'
import { Icon } from '../../../core/components/Icon'
import { useToast } from '../../../core/hooks/useToast'
import { adminService } from '../services'
import type { Role, Usuario } from '../types'

type Pending = { role: Role; action: 'add' | 'remove' }

/** Atribuição e remoção de roles com visualização das permissões de cada papel. */
export default function RoleManager({ usuario, roles, onChange }: { usuario: Usuario; roles: Role[]; onChange: (u: Usuario) => void }) {
  const toast = useToast()
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    if (!pending) return
    setBusy(true)
    try {
      const fn = pending.action === 'add' ? adminService.atribuirRole : adminService.removerRole
      onChange(await fn(usuario.id, pending.role.id))
      toast(pending.action === 'add' ? 'Role atribuída com sucesso' : 'Role removida com sucesso')
      setPending(null)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha ao atualizar role', 'error')
    } finally { setBusy(false) }
  }

  return (
    <Card title="Roles e permissões">
      <ul className="role-list">
        {roles.map((r) => {
          const has = usuario.roles.includes(r.id)
          return (
            <li key={r.id} className={has ? 'role has' : 'role'}>
              <div className="role-info">
                <strong>{r.nome}</strong>
                <span className="muted">{r.descricao}</span>
                <div className="perms">{r.permissoes.map((p) => <code key={p}>{p}</code>)}</div>
              </div>
              <button type="button" className={`btn ${has ? 'danger-soft' : 'primary-soft'}`} onClick={() => setPending({ role: r, action: has ? 'remove' : 'add' })}>
                <Icon name={has ? 'x' : 'plus'} size={16} /> {has ? 'Remover' : 'Atribuir'}
              </button>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={!!pending}
        loading={busy}
        tone={pending?.action === 'remove' ? 'danger' : 'primary'}
        title={pending?.action === 'add' ? 'Atribuir role' : 'Remover role'}
        message={pending && <>Deseja {pending.action === 'add' ? 'atribuir' : 'remover'} a role <b>{pending.role.nome}</b> {pending.action === 'add' ? 'a' : 'de'} <b>{usuario.nome}</b>? As permissões do usuário mudam imediatamente.</>}
        confirmLabel={pending?.action === 'add' ? 'Atribuir' : 'Remover'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </Card>
  )
}
