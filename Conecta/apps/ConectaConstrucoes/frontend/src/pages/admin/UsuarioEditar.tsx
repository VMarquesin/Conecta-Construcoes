import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, ConfirmDialog, ErrorState, PageHeader, Spinner } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useToast } from '../../core/hooks/useToast'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'

const campos = [
  ['nome', 'Nome completo', 'text'],
  ['email', 'E-mail', 'email'],
  ['telefone', 'Telefone', 'tel'],
  ['cidade', 'Cidade', 'text'],
] as const
type Dados = Record<(typeof campos)[number][0], string>

export default function UsuarioEditar() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { data: u, loading, error, reload } = useAsync(() => adminService.obterUsuario(id), [id])
  const [form, setForm] = useState<Dados | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  if (loading && !u) return <Spinner />
  if (error || !u) return <ErrorState message={error ?? 'Usuário não encontrado'} onRetry={reload} />
  const values: Dados = form ?? { nome: u.nome, email: u.email, telefone: u.telefone, cidade: u.cidade }

  async function salvar() {
    setBusy(true)
    try {
      await adminService.atualizarUsuario(id, values)
      toast('Usuário atualizado')
      nav(`/admin/usuarios/${id}`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha ao salvar', 'error')
      setConfirm(false)
    } finally { setBusy(false) }
  }

  return (
    <>
      <Link to={`/admin/usuarios/${id}`} className="back"><Icon name="back" size={16} /> Voltar</Link>
      <PageHeader title="Editar usuário" subtitle={u.nome} />
      <Card>
        <form className="form" onSubmit={(e: FormEvent) => { e.preventDefault(); setConfirm(true) }}>
          {campos.map(([k, label, type]) => (
            <label key={k} className="field">
              <span>{label}</span>
              <input type={type} required value={values[k]} onChange={(e) => setForm({ ...values, [k]: e.target.value })} />
            </label>
          ))}
          <div className="form-actions">
            <Link to={`/admin/usuarios/${id}`} className="btn">Cancelar</Link>
            <button type="submit" className="btn primary">Salvar alterações</button>
          </div>
        </form>
      </Card>
      <ConfirmDialog open={confirm} loading={busy} title="Salvar alterações" confirmLabel="Salvar"
        message={<>Confirma a alteração dos dados de <b>{u.nome}</b>?</>}
        onConfirm={salvar} onCancel={() => setConfirm(false)} />
    </>
  )
}
