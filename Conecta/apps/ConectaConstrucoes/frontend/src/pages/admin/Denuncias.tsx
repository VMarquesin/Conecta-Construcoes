import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, Spinner } from '../../core/components/ui'
import { Icon } from '../../core/components/Icon'
import { useToast } from '../../core/hooks/useToast'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'
import { StatusDenunciaBadge } from '../../features/admin/components/Badges'
import { formatDateTime } from '../../features/admin/format'
import type { AcaoModeracao, Denuncia } from '../../features/admin/types'

const acoes: Record<AcaoModeracao, { label: string; titulo: string; texto: string; tone: 'primary' | 'danger'; icon: 'check' | 'alert' | 'ban' }> = {
  ARQUIVAR: { label: 'Arquivar', titulo: 'Arquivar denúncia', texto: 'A denúncia será marcada como improcedente.', tone: 'primary', icon: 'check' },
  ADVERTIR: { label: 'Advertir', titulo: 'Advertir usuário', texto: 'O denunciado receberá uma advertência formal.', tone: 'danger', icon: 'alert' },
  BLOQUEAR_USUARIO: { label: 'Bloquear', titulo: 'Bloquear usuário', texto: 'A conta do denunciado será bloqueada imediatamente.', tone: 'danger', icon: 'ban' },
}

export default function Denuncias() {
  const toast = useToast()
  const [filtro, setFiltro] = useState<'ABERTAS' | 'TODAS'>('ABERTAS')
  const [alvo, setAlvo] = useState<{ d: Denuncia; acao: AcaoModeracao } | null>(null)
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload } = useAsync(() => adminService.listarDenuncias(), [])

  const lista = data?.filter((d) => filtro === 'TODAS' || d.status === 'ABERTA' || d.status === 'EM_ANALISE') ?? []

  async function executar(obs: string) {
    if (!alvo) return
    setBusy(true)
    try {
      await adminService.moderarDenuncia(alvo.d.id, alvo.acao, obs)
      toast('Ação de moderação registrada')
      setAlvo(null)
      await reload()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha na operação', 'error')
    } finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="Denúncias" subtitle="Analise ocorrências e aplique ações de moderação" />
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={filtro === 'ABERTAS'} className={filtro === 'ABERTAS' ? 'on' : ''} onClick={() => setFiltro('ABERTAS')}>Em aberto</button>
        <button role="tab" aria-selected={filtro === 'TODAS'} className={filtro === 'TODAS' ? 'on' : ''} onClick={() => setFiltro('TODAS')}>Todas</button>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && lista.length === 0 && <EmptyState title="Nenhuma denúncia" text="Não há denúncias para exibir." />}

      <div className="cards-list">
        {lista.map((d) => {
          const encerrada = d.status === 'PROCEDENTE' || d.status === 'IMPROCEDENTE'
          return (
            <article key={d.id} className="item col">
              <div className="item-top">
                <div>
                  <strong>{d.motivo}</strong>
                  <small className="muted"> · {formatDateTime(d.criadaEm)}</small>
                </div>
                <StatusDenunciaBadge status={d.status} />
              </div>
              <p className="desc">{d.descricao}</p>
              <div className="parties">
                <span>Denunciante: <b>{d.denuncianteNome}</b></span>
                <span>Denunciado: <Link className="link" to={`/admin/usuarios/${d.denunciadoId}`}>{d.denunciadoNome}</Link></span>
              </div>
              {encerrada ? (
                <small className="muted">Ação tomada: {d.acaoTomada ? acoes[d.acaoTomada].label : '—'}</small>
              ) : (
                <div className="item-actions wrap">
                  {(Object.keys(acoes) as AcaoModeracao[]).map((a) => (
                    <button key={a} type="button" className={`btn ${acoes[a].tone === 'danger' ? 'danger-soft' : ''}`} onClick={() => setAlvo({ d, acao: a })}>
                      <Icon name={acoes[a].icon} size={16} /> {acoes[a].label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!alvo} loading={busy}
        tone={alvo ? acoes[alvo.acao].tone : 'primary'}
        title={alvo ? acoes[alvo.acao].titulo : ''}
        message={alvo && <>{acoes[alvo.acao].texto} Denunciado: <b>{alvo.d.denunciadoNome}</b>.</>}
        reasonLabel="Observação da moderação" reasonRequired
        confirmLabel={alvo ? acoes[alvo.acao].label : 'Confirmar'}
        onConfirm={executar} onCancel={() => setAlvo(null)}
      />
    </>
  )
}
