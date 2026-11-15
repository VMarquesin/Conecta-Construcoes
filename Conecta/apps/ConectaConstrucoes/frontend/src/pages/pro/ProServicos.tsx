import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../core/hooks/useToast'
import { pedidoService, type PedidoResumoResponse } from '../../features/cliente/services/pedidoService'
import './ProServicos.css'

type AbaServicos = 'pendente' | 'em_andamento' | 'aceito' | 'concluido' | 'cancelado'

export default function ProServicos() {
  const navigate = useNavigate()
  const { usuario } = useSession()
  const toast = useToast()

  const [pedidos, setPedidos] = useState<PedidoResumoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [concluindoId, setConcluindoId] = useState<number | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<AbaServicos>('pendente')
  const [pedidoParaConcluir, setPedidoParaConcluir] = useState<PedidoResumoResponse | null>(null)

  const carregarPedidos = () => {
    const token = localStorage.getItem('conecta.token') || localStorage.getItem('token')
    if (!token && !usuario) {
      setLoading(false)
      return
    }

    setLoading(true)
    const usuarioIdNum = usuario?.id ? Number(usuario.id) : undefined
    pedidoService
      .listarPedidosPrestador(usuarioIdNum)
      .then((data) => {
        const unique = Array.isArray(data)
          ? Array.from(new Map(data.map((item) => [item.id, item])).values())
          : []
        setPedidos(unique)
      })
      .catch((err) => {
        console.error('Erro ao listar serviços do prestador:', err)
        toast.error('Não foi possível carregar os serviços.')
        setPedidos([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    carregarPedidos()
  }, [usuario?.id])

  // 1. Concluídos: Exibe pedidos estritamente finalizados (prioridade máxima)
  const isConcluido = (p: PedidoResumoResponse) => {
    const s = (p.status || '').toUpperCase()
    return s === 'CONCLUIDA' || s === 'CONCLUIDO' || s === 'FINALIZADO'
  }

  // 2. Cancelados: Exibe pedidos cancelados/recusados
  const isCancelado = (p: PedidoResumoResponse) => {
    const s = (p.status || '').toUpperCase()
    return (s === 'CANCELADO' || s === 'CANCELADA' || s === 'RECUSADO' || s === 'RECUSADA') && !isConcluido(p)
  }

  // 3. Aceitos: Exibe pedidos com status ACEITA, ACEITO ou AGENDADO
  const isAceito = (p: PedidoResumoResponse) => {
    const s = (p.status || '').toUpperCase()
    return (s === 'ACEITA' || s === 'ACEITO' || s === 'AGENDADO' || s === 'EM_EXECUCAO') && !isConcluido(p) && !isCancelado(p)
  }

  // 4. Em Andamento: Exibe pedidos em negociação ou proposta enviada
  const isEmAndamento = (p: PedidoResumoResponse) => {
    const s = (p.status || '').toUpperCase()
    return (s === 'EM_ANDAMENTO' || s === 'AGUARDANDO_ACEITE' || s === 'PROPOSTA_RECEBIDA' || s === 'EM_NEGOCIACAO') && !isConcluido(p) && !isCancelado(p) && !isAceito(p)
  }

  // 5. Pendentes: Exibe pedidos novos aguardando análise/proposta do prestador
  const isPendente = (p: PedidoResumoResponse) => {
    const s = (p.status || '').toUpperCase()
    return (s === 'ABERTA' || s === 'PENDENTE' || s === 'AGUARDANDO_PROPOSTA') && !isConcluido(p) && !isCancelado(p) && !isAceito(p) && !isEmAndamento(p)
  }

  const numPendentes = pedidos.filter(isPendente).length
  const numEmAndamento = pedidos.filter(isEmAndamento).length
  const numAceitos = pedidos.filter(isAceito).length
  const numConcluidos = pedidos.filter(isConcluido).length
  const numCancelados = pedidos.filter(isCancelado).length

  const pedidosFiltrados = pedidos.filter((p) => {
    if (abaAtiva === 'pendente') return isPendente(p)
    if (abaAtiva === 'em_andamento') return isEmAndamento(p)
    if (abaAtiva === 'aceito') return isAceito(p)
    if (abaAtiva === 'concluido') return isConcluido(p)
    if (abaAtiva === 'cancelado') return isCancelado(p)
    return true
  })

  const executarConcluir = async (pedido: PedidoResumoResponse) => {
    try {
      setConcluindoId(pedido.id)
      await pedidoService.concluirPedido(pedido.id)
      toast.success('Serviço marcado como concluído! O cliente será notificado.')

      // Atualiza o estado do componente movendo o card para "Concluídos"
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? { ...p, status: 'CONCLUIDA', statusTexto: 'Concluído' }
            : p
        )
      )
      setAbaAtiva('concluido')
      setPedidoParaConcluir(null)
      carregarPedidos()
    } catch (err: any) {
      console.error('Erro ao concluir serviço:', err)
      toast.error(err.message || 'Erro ao marcar serviço como concluído.')
    } finally {
      setConcluindoId(null)
    }
  }

  const handleAbrirChat = (pedido: PedidoResumoResponse) => {
    navigate('/pro/mensagens', {
      state: {
        contatoId: pedido.clienteId || pedido.id,
        nome: pedido.clienteNome || 'Cliente',
        foto: (pedido as any).clienteAvatar || (pedido as any).clienteFoto || ''
      }
    })
  }

  return (
    <div className="pedidos-viewport">
      <div className="pedidos-container">
        <main className="pedidos-main">
          {/* Título e Ação */}
          <div className="pedidos-title-row">
            <div className="pedidos-titles">
              <h1 className="pedidos-page-title">Meus Serviços (Conecta PRO)</h1>
              <p className="pedidos-page-subtitle">Acompanhe suas ordens de serviço, novas solicitações e finalizações</p>
            </div>

            <button
              className="pedidos-support-btn"
              title="Central de Ajuda PRO"
              onClick={() => toast.info('Abrindo suporte Conecta PRO...')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </button>
          </div>

          {/* Banner Conecta PRO */}
          <div className="pro-banner-accent">
            <div className="pro-banner-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Garantia e Pagamento Conecta PRO</h4>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                Os serviços em andamento possuem garantia protegida. Ao finalizar a execução com o cliente, marque como concluído para que o valor contabilize em seus ganhos.
              </p>
            </div>
          </div>

          {/* Abas de Status da Esteira */}
          <div className="pedidos-tabs-bar">
            <button
              className={`tab-btn ${abaAtiva === 'pendente' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('pendente')}
            >
              <span>Pendentes</span>
              <span className="tab-badge amber">{numPendentes}</span>
            </button>

            <button
              className={`tab-btn ${abaAtiva === 'em_andamento' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('em_andamento')}
            >
              <span>Em Andamento</span>
              <span className="tab-badge blue">{numEmAndamento}</span>
            </button>

            <button
              className={`tab-btn ${abaAtiva === 'aceito' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('aceito')}
            >
              <span>Aceitos</span>
              <span className="tab-badge green">{numAceitos}</span>
            </button>

            <button
              className={`tab-btn ${abaAtiva === 'concluido' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('concluido')}
            >
              <span>Concluídos</span>
              <span className="tab-badge gray">{numConcluidos}</span>
            </button>

            {numCancelados > 0 && (
              <button
                className={`tab-btn ${abaAtiva === 'cancelado' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('cancelado')}
              >
                <span>Cancelados</span>
                <span className="tab-badge gray">{numCancelados}</span>
              </button>
            )}
          </div>

          {/* Grid de Serviços */}
          <div className="pedidos-cards-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', gridColumn: '1 / -1' }}>
                <p>Carregando serviços...</p>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', gridColumn: '1 / -1' }}>
                <h3>Nenhum serviço nesta categoria</h3>
                <p>Suas ordens de serviço e solicitações aparecerão aqui conforme clientes entrarem em contato.</p>
                <Link
                  to="/pro/dashboard"
                  className="btn-detalhes-pedido"
                  style={{ display: 'inline-flex', marginTop: '14px', textDecoration: 'none', padding: '0 20px' }}
                >
                  Voltar ao Dashboard
                </Link>
              </div>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <article key={pedido.id} className="pedido-card">
                  {/* Linha do Cliente (Header limpo e elegante - idêntico à visão do cliente) */}
                  <div className="pedido-prof-header">
                    <div className="pedido-prof-left" style={{ flex: 1, minWidth: 0 }}>
                      <div className="pedido-prof-avatar-wrap">
                        <div
                          className="pedido-prof-avatar-img"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#0056D6',
                            color: '#fff',
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="pedido-prof-check">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </div>

                      <div className="pedido-prof-info" style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="pedido-prof-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span>{pedido.clienteNome || 'Cliente Conecta'}</span>
                        </h3>
                        <p className="pedido-prof-service">{pedido.prestadorProfissao}</p>
                        <span className="pedido-prof-time">{pedido.solicitadoEm}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo do Pedido */}
                  <div className="pedido-details-bubble">
                    <h4 className="pedido-details-title">{pedido.tituloServico}</h4>
                    <p className="pedido-details-desc">{pedido.descricaoServico}</p>
                  </div>

                  {/* Preço e Status na mesma linha (Organização flexbox para evitar quebras) */}
                  <div className="pedido-price-row">
                    <div className="pedido-price-left">
                      <span className="pedido-price-hint">{pedido.valorLabel}</span>
                      <span className={`pedido-price-val ${!pedido.valorIsPreco ? 'neutral' : ''}`}>
                        {pedido.valorTexto}
                      </span>
                    </div>

                    <div className="pedido-status-container flex items-center gap-2">
                      <span
                        className={`pedido-status-pill ${
                          isCancelado(pedido)
                            ? 'status-cancelado'
                            : isPendente(pedido)
                            ? 'status-pendente'
                            : isEmAndamento(pedido)
                            ? 'status-andamento'
                            : isAceito(pedido)
                            ? 'status-aceito'
                            : 'status-concluido'
                        }`}
                      >
                        {isCancelado(pedido) && '✕ '}
                        {isPendente(pedido) && '⏳ '}
                        {isEmAndamento(pedido) && '💬 '}
                        {isAceito(pedido) && '✓ '}
                        {isConcluido(pedido) && '★ '}
                        {isCancelado(pedido)
                          ? 'Cancelado'
                          : isPendente(pedido)
                          ? 'Aguardando proposta'
                          : isEmAndamento(pedido)
                          ? 'Aguardando aceite'
                          : isAceito(pedido)
                          ? 'Confirmado'
                          : 'Concluído'}
                      </span>

                      {pedido.statusDica && pedido.statusDica !== 'Aguardando proposta' && (
                        <span className="pedido-status-hint">
                          {pedido.dicaIcone === 'clock' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          )}
                          {pedido.dicaIcone === 'check' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          <span>{pedido.statusDica}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="pedido-card-actions">
                    {isCancelado(pedido) ? (
                      <span className="badge-cancelado-tag">✕ Serviço Cancelado</span>
                    ) : isPendente(pedido) ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                        <button
                          className="btn-detalhes-pedido"
                          onClick={() => navigate(`/pro/solicitacao/${pedido.id}`)}
                          style={{ flex: 1.2 }}
                        >
                          <span>Analisar / Enviar Proposta</span>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                        <button
                          className="btn-chat-servico"
                          onClick={() => handleAbrirChat(pedido)}
                          title="Falar com o cliente"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>Chat</span>
                        </button>
                      </div>
                    ) : isEmAndamento(pedido) ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                        <button
                          className="btn-negociar-chat"
                          onClick={() => handleAbrirChat(pedido)}
                          style={{ flex: 1.2 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>Negociar / Chat</span>
                        </button>
                        <button
                          className="btn-detalhes-pedido"
                          onClick={() => navigate(`/pro/solicitacao/${pedido.id}`)}
                          style={{ padding: '10px 14px' }}
                          title="Ver detalhes da proposta enviada"
                        >
                          <span>Ver Proposta</span>
                        </button>
                      </div>
                    ) : isAceito(pedido) ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                        <button
                          className="btn-concluir-servico"
                          onClick={() => setPedidoParaConcluir(pedido)}
                          disabled={concluindoId === pedido.id}
                          style={{ flex: 1.2 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{concluindoId === pedido.id ? 'Concluindo...' : 'Marcar como Concluído'}</span>
                        </button>

                        <button
                          className="btn-chat-servico"
                          onClick={() => handleAbrirChat(pedido)}
                          title="Abrir chat do pedido"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>Chat</span>
                        </button>

                        <button
                          className="btn-detalhes-pedido"
                          onClick={() => navigate(`/pedidos/${pedido.id}`)}
                          style={{ padding: '10px 14px' }}
                          title="Ver detalhes"
                        >
                          <span>Detalhes</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="pro-badge-concluido">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Concluído e Faturado
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-chat-servico"
                            onClick={() => handleAbrirChat(pedido)}
                          >
                            <span>Chat</span>
                          </button>
                          <button
                            className="btn-detalhes-pedido"
                            onClick={() => navigate(`/pedidos/${pedido.id}`)}
                          >
                            <span>Detalhes</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal Customizado de Conclusão de Serviço */}
      {pedidoParaConcluir && (
        <div className="modal-overlay" onClick={() => !concluindoId && setPedidoParaConcluir(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-concluir">
              <div className="modal-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="modal-title-concluir">Concluir Serviço</h3>
                <p className="modal-desc-concluir">
                  Deseja realmente marcar o serviço de <strong>{pedidoParaConcluir.clienteNome || 'Cliente'}</strong> como concluído?
                  O cliente será notificado e os ganhos serão liberados no seu Dashboard.
                </p>
              </div>
            </div>

            <div className="modal-actions-concluir">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setPedidoParaConcluir(null)}
                disabled={concluindoId !== null}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-confirmar"
                onClick={() => executarConcluir(pedidoParaConcluir)}
                disabled={concluindoId !== null}
              >
                {concluindoId === pedidoParaConcluir.id ? (
                  <span>Concluindo...</span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Confirmar Conclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
