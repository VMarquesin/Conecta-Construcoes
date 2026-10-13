import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, Spinner, Badge } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useToast } from '../../core/hooks/useToast'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'
import { formatDateTime } from '../../features/admin/format'
import type { Documento } from '../../features/admin/types'

type Alvo = { doc: Documento; acao: 'aprovar' | 'rejeitar' }

export default function DocumentosPendentes() {
  const toast = useToast()
  const [aba, setAba] = useState<'TODOS' | 'PRESTADOR' | 'CLIENTE'>('TODOS')
  const [alvo, setAlvo] = useState<Alvo | null>(null)
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload } = useAsync(() => adminService.listarDocumentosPendentes(), [])

  const lista = data?.filter((d) => aba === 'TODOS' || d.tipoUsuario === aba) ?? []

  async function executar(motivo: string) {
    if (!alvo) return
    setBusy(true)
    try {
      if (alvo.acao === 'aprovar') await adminService.aprovarDocumento(alvo.doc.id)
      else await adminService.rejeitarDocumento(alvo.doc.id, motivo)
      toast(alvo.acao === 'aprovar' ? 'Documento aprovado' : 'Documento rejeitado')
      setAlvo(null)
      await reload()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha na operação', 'error')
    } finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="Documentos pendentes" subtitle="Analise documentos enviados por prestadores e clientes" />
      <div className="tabs" role="tablist">
        {(['TODOS', 'PRESTADOR', 'CLIENTE'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={aba === t} className={aba === t ? 'on' : ''} onClick={() => setAba(t)}>
            {t === 'TODOS' ? 'Todos' : t === 'PRESTADOR' ? 'Prestadores' : 'Clientes'}
          </button>
        ))}
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && lista.length === 0 && <EmptyState title="Tudo em dia" text="Não há documentos pendentes nesta categoria." />}

      <div className="cards-list">
        {lista.map((d) => (
          <article key={d.id} className="item">
            <div className="item-icon"><Icon name="file" size={22} /></div>
            <div className="item-body">
              <strong>{d.tipoDocumento}</strong>
              <span><Link className="link" to={`/admin/usuarios/${d.usuarioId}`}>{d.usuarioNome}</Link> <Badge tone="neutral">{d.tipoUsuario === 'PRESTADOR' ? 'Prestador' : 'Cliente'}</Badge></span>
              <small className="muted"><Icon name="clock" size={12} /> Enviado em {formatDateTime(d.enviadoEm)}</small>
            </div>
            <div className="item-actions">
              <button type="button" className="btn danger-soft" onClick={() => setAlvo({ doc: d, acao: 'rejeitar' })}><Icon name="x" size={16} /> Rejeitar</button>
              <button type="button" className="btn primary" onClick={() => setAlvo({ doc: d, acao: 'aprovar' })}><Icon name="check" size={16} /> Aprovar</button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={!!alvo} loading={busy}
        tone={alvo?.acao === 'rejeitar' ? 'danger' : 'primary'}
        title={alvo?.acao === 'aprovar' ? 'Aprovar documento' : 'Rejeitar documento'}
        message={alvo && <>{alvo.doc.tipoDocumento} de <b>{alvo.doc.usuarioNome}</b>.</>}
        reasonLabel={alvo?.acao === 'rejeitar' ? 'Motivo da rejeição' : undefined}
        reasonRequired
        confirmLabel={alvo?.acao === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
        onConfirm={executar} onCancel={() => setAlvo(null)}
      />
    </>
  )
}
