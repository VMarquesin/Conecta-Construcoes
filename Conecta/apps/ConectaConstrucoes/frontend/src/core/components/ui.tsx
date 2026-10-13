import { useEffect, useId, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'info'; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return <div className="state" role="status"><span className="spinner" />{label}</div>
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="state empty">
      <Icon name="check" size={28} />
      <strong>{title}</strong>
      {text && <span className="muted">{text}</span>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state error" role="alert">
      <Icon name="alert" size={28} />
      <strong>Algo deu errado</strong>
      <span className="muted">{message}</span>
      {onRetry && <button className="btn" onClick={onRetry}>Tentar novamente</button>}
    </div>
  )
}

export function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(title || actions) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatCard({ label, value, icon, tone = 'info', to }: { label: string; value: number | string; icon: Parameters<typeof Icon>[0]['name']; tone?: 'info' | 'ok' | 'warn' | 'danger'; to?: () => void }) {
  const Tag = to ? 'button' : 'div'
  return (
    <Tag className={`stat stat-${tone}`} onClick={to} type={to ? 'button' : undefined}>
      <span className="stat-icon"><Icon name={icon} size={22} /></span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </Tag>
  )
}

interface ConfirmProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  tone?: 'primary' | 'danger'
  /** Quando definido, exibe campo de texto (ex.: motivo) e envia o valor ao confirmar */
  reasonLabel?: string
  reasonRequired?: boolean
  loading?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

/** Diálogo de confirmação reutilizável para ações sensíveis. */
export function ConfirmDialog(props: ConfirmProps) {
  // O corpo só existe enquanto aberto: o campo de motivo é reiniciado a cada abertura.
  return props.open ? <ConfirmDialogBody {...props} /> : null
}

function ConfirmDialogBody({ title, message, confirmLabel = 'Confirmar', tone = 'primary', reasonLabel, reasonRequired, loading, onConfirm, onCancel }: ConfirmProps) {
  const [reason, setReason] = useState('')
  const id = useId()

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onCancel])

  const invalid = !!reasonLabel && !!reasonRequired && !reason.trim()

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-t`} onMouseDown={(e) => e.stopPropagation()}>
        <div className={`dialog-icon ${tone}`}><Icon name={tone === 'danger' ? 'alert' : 'shield'} size={22} /></div>
        <h3 id={`${id}-t`}>{title}</h3>
        <p className="muted">{message}</p>
        {reasonLabel && (
          <label className="field">
            <span>{reasonLabel}{reasonRequired && ' *'}</span>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
          </label>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className={`btn ${tone === 'danger' ? 'danger' : 'primary'}`} disabled={invalid || loading} onClick={() => onConfirm(reason.trim())}>
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
