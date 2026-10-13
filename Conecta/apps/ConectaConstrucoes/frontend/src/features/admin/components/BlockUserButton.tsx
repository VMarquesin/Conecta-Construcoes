import { useState } from 'react'
import { ConfirmDialog } from '../../../core/components/ui'
import { Icon } from '../../../core/components/Icon'
import { useToast } from '../../../core/hooks/useToast'
import { adminService } from '../services'
import type { Usuario } from '../types'

/** Botão bloquear/desbloquear com confirmação (e motivo obrigatório ao bloquear). */
export default function BlockUserButton({ usuario, onChange }: { usuario: Usuario; onChange: (u: Usuario) => void }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const blocked = usuario.status === 'BLOQUEADO'

  async function run(motivo: string) {
    setBusy(true)
    try {
      onChange(blocked ? await adminService.desbloquearUsuario(usuario.id) : await adminService.bloquearUsuario(usuario.id, motivo))
      toast(blocked ? 'Conta desbloqueada' : 'Conta bloqueada')
      setOpen(false)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha na operação', 'error')
    } finally { setBusy(false) }
  }

  return (
    <>
      <button type="button" className={`btn ${blocked ? 'primary-soft' : 'danger-soft'}`} onClick={() => setOpen(true)}>
        <Icon name={blocked ? 'check' : 'ban'} size={16} /> {blocked ? 'Desbloquear' : 'Bloquear conta'}
      </button>
      <ConfirmDialog
        open={open}
        loading={busy}
        tone={blocked ? 'primary' : 'danger'}
        title={blocked ? 'Desbloquear conta' : 'Bloquear conta'}
        message={<>{blocked ? 'Restaurar o acesso de' : 'O usuário perderá o acesso ao sistema:'} <b>{usuario.nome}</b>.</>}
        reasonLabel={blocked ? undefined : 'Motivo do bloqueio'}
        reasonRequired={!blocked}
        confirmLabel={blocked ? 'Desbloquear' : 'Bloquear'}
        onConfirm={run}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
