import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../core/hooks/useToast'
import { chatService, type MensagemItemResponse } from '../features/cliente/services/chatService'
import { pedidoService } from '../features/cliente/services/pedidoService'
import './ChatPedido.css'

export default function ChatPedido() {
  const navigate = useNavigate()
  const toast = useToast()
  const { id } = useParams<{ id?: string }>()
  const pedidoNumero = id || '1'

  const [mensagens, setMensagens] = useState<MensagemItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [novoTexto, setNovoTexto] = useState('')

  const [prestadorNome, setPrestadorNome] = useState('Profissional')
  const [prestadorAvatar, setPrestadorAvatar] = useState('')
  const [tituloServico, setTituloServico] = useState('Serviço Solicitado')
  const [valorServico, setValorServico] = useState<number | null>(null)

  const [propostaStatus, setPropostaStatus] = useState<'pendente' | 'aprovada' | 'recusada'>('pendente')
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const carregarMensagens = () => {
    chatService
      .listarMensagens(Number(pedidoNumero))
      .then((data) => setMensagens(data))
      .catch((err) => console.error('Erro ao listar mensagens:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    carregarMensagens()

    // Carrega dados do pedido para o header
    pedidoService
      .obterDetalhesPedido(Number(pedidoNumero))
      .then((p) => {
        if (p) {
          setPrestadorNome(p.prestadorNome)
          if (p.prestadorAvatar) setPrestadorAvatar(p.prestadorAvatar)
          setTituloServico(p.tituloServico)
          setValorServico(p.valorFinal ?? p.valorCombinado ?? null)
        }
      })
      .catch((err) => console.warn('Detalhes do pedido não carregados para o chat:', err))
  }, [pedidoNumero])

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoTexto.trim() || enviando) return

    const texto = novoTexto.trim()
    setNovoTexto('')
    setEnviando(true)

    try {
      const msgCriada = await chatService.enviarMensagem(Number(pedidoNumero), { texto })
      setMensagens((prev) => [...prev, msgCriada])
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err)
      toast.error(err.message || 'Erro ao enviar a mensagem.')
      setNovoTexto(texto)
    } finally {
      setEnviando(false)
    }
  }

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  return (
    <div className="chat-viewport">
      <div className="chat-container">
        {/* Header do Chat com o Prestador */}
        <div className="chat-conversation-header">
          <div className="chat-header-left">
            <button
              className="chat-back-btn"
              onClick={() => navigate(`/pedidos/${pedidoNumero}`)}
              title="Voltar para Detalhes do Pedido"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <div className="chat-prestador-avatar-wrap">
              {prestadorAvatar ? (
                <img src={prestadorAvatar} alt={prestadorNome} className="chat-prestador-avatar" />
              ) : (
                <div className="chat-prestador-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0056D6', color: '#fff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <span className="chat-online-badge" title="Online agora" />
            </div>

            <div className="chat-prestador-meta">
              <div className="chat-prestador-nome-row">
                <span className="chat-prestador-name">{prestadorNome}</span>
                <span className="chat-verified-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#0056D6">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <span className="chat-status-text">Online agora • Responde em ~15 min</span>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              className="chat-action-circle"
              title={`Ligar para ${prestadorNome}`}
              onClick={() => toast.info(`Ligação direta iniciada com ${prestadorNome}`)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>

            <button className="chat-action-circle" title="Opções da conversa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Banner Sticky do Pedido no Topo do Chat */}
        <div className="chat-pedido-sticky-banner">
          <div className="sticky-banner-left">
            <div className="sticky-lightning-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0056D6" stroke="#0056D6" strokeWidth="1">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="sticky-info-col">
              <div className="sticky-tag-row">
                <span className="sticky-pedido-num">#{pedidoNumero}</span>
                <span className="sticky-status-chip">Orçamento em análise</span>
              </div>
              <span className="sticky-servico-resumo">{tituloServico}</span>
            </div>
          </div>

          <div className="sticky-banner-right">
            <div className="sticky-valor-col">
              <span className="sticky-valor-hint">Valor</span>
              <strong className="sticky-valor-amount">{valorServico != null ? `R$ ${valorServico}` : 'A combinar'}</strong>
            </div>
            <button
              className="sticky-btn-aceitar"
              onClick={() => navigate(`/pedidos/${pedidoNumero}`)}
            >
              Aceitar
            </button>
          </div>
        </div>

        {/* Caixa de Mensagens do Chat */}
        <div className="chat-messages-box">
          {/* Banner de Segurança Conecta Protege */}
          <div className="chat-seguranca-banner">
            <div className="seguranca-shield">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <p className="seguranca-text">
              Por sua segurança, mantenha conversas e pagamentos dentro da plataforma{' '}
              <strong className="link-protege">Conecta Protege</strong>.
            </p>
          </div>

          {/* Marcador de Data */}
          <div className="chat-date-divider">
            <span>Hoje</span>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <p>Carregando mensagens da conversa...</p>
            </div>
          ) : mensagens.length === 0 ? (
            <div className="chat-empty-state-box" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px', marginBottom: '6px' }}>Nenhuma mensagem ainda</p>
              <span style={{ fontSize: '13px' }}>
                {prestadorNome && prestadorNome !== 'Profissional'
                  ? `Envie uma mensagem abaixo para iniciar o contato com ${prestadorNome}.`
                  : 'Envie uma mensagem abaixo para iniciar a conversa.'}
              </span>
            </div>
          ) : (
            mensagens.map((msg) => {
              if (msg.remetente === 'usuario') {
                return (
                  <div key={msg.id} className="msg-row msg-row-user">
                    <div className="msg-bubble-user">
                      {msg.texto && <p className="msg-user-text">{msg.texto}</p>}

                      {msg.imagemUrl && (
                        <div
                          className="msg-user-image-wrap"
                          onClick={() => setModalFotoZoom(msg.imagemUrl || null)}
                          title="Clique para ampliar"
                        >
                          <img
                            src={msg.imagemUrl}
                            alt="Foto anexada"
                            className="msg-attached-img"
                          />
                          <div className="img-attachment-label">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span>{msg.imagemLegenda || 'Anexo'}</span>
                          </div>
                        </div>
                      )}

                      <div className="msg-meta-row">
                        <span className="msg-time">{msg.hora}</span>
                        {msg.status && (
                          <>
                            <span className="msg-meta-dot">•</span>
                            <span className="msg-status">{msg.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              // Remetente: Prestador
              return (
                <div key={msg.id} className="msg-row msg-row-prestador">
                  {prestadorAvatar ? (
                    <img src={prestadorAvatar} alt={prestadorNome} className="msg-prestador-avatar" />
                  ) : (
                    <div className="msg-prestador-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}

                  <div className="msg-prestador-content">
                    {msg.texto && (
                      <div className="msg-bubble-prestador">
                        <p className="msg-prestador-text">{msg.texto}</p>
                        <span className="msg-time-left">{msg.hora}</span>
                      </div>
                    )}

                    {msg.isProposta && (
                      <div className="card-proposta-oficial">
                        <div className="proposta-header">
                          <div className="proposta-title-row">
                            <div className="proposta-icon-wrap">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                              </svg>
                            </div>
                            <div>
                              <span className="proposta-label">PROPOSTA OFICIAL</span>
                              <h4 className="proposta-heading">Orçamento Formalizado</h4>
                            </div>
                          </div>

                          <span className="garantia-pill-verde">Garantia 90 dias</span>
                        </div>

                        {/* Checklist da Proposta */}
                        <div className="proposta-checklist">
                          <div className="check-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>1x Troca de disjuntor bipolar 40A curva C (norma NBR 5410)</span>
                          </div>
                          <div className="check-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Revisão e aperto térmico de conectores e fiação 6mm²</span>
                          </div>
                          <div className="check-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Visita técnica e testes operacionais inclusos</span>
                          </div>
                        </div>

                        {/* Total da Proposta */}
                        <div className="proposta-total-row">
                          <span className="proposta-total-hint">Total parcelável em até 3x</span>
                          <strong className="proposta-total-val">R$ 180,00</strong>
                        </div>

                        {/* Ações da Proposta */}
                        {propostaStatus === 'pendente' && (
                          <div className="proposta-actions-row">
                            <button
                              className="btn-proposta-recusar"
                              onClick={() => {
                                if (confirm('Deseja recusar esta proposta?')) {
                                  setPropostaStatus('recusada')
                                }
                              }}
                            >
                              Recusar
                            </button>
                            <button
                              className="btn-proposta-aprovar"
                              onClick={() => {
                                setPropostaStatus('aprovada')
                                navigate(`/pedidos/${pedidoNumero}`)
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                              <span>Aprovar e Pagar</span>
                            </button>
                          </div>
                        )}

                        {propostaStatus === 'aprovada' && (
                          <div className="proposta-status-feedback status-aprovada">
                            ✓ Proposta Aprovada! Redirecionando para o pagamento...
                          </div>
                        )}

                        {propostaStatus === 'recusada' && (
                          <div className="proposta-status-feedback status-recusada">
                            Proposta Recusada. Você pode solicitar um novo valor pelo chat.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Inferior de Chat */}
        <form className="chat-input-bar" onSubmit={handleEnviarMensagem}>
          <button
            type="button"
            className="chat-attach-btn"
            title="Anexar foto ou arquivo"
            onClick={() => toast.info('Abrindo seletor de imagens...')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input
            type="text"
            className="chat-text-input"
            placeholder={`Digite uma mensagem para ${prestadorNome}...`}
            value={novoTexto}
            disabled={enviando}
            onChange={(e) => setNovoTexto(e.target.value)}
          />

          <button type="submit" className="chat-send-btn" title="Enviar Mensagem" disabled={enviando || !novoTexto.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        {/* Modal Zoom Foto */}
        {modalFotoZoom && (
          <div className="modal-overlay" onClick={() => setModalFotoZoom(null)}>
            <div className="modal-foto-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-foto-header">
                <span>Foto anexada na conversa</span>
                <button className="modal-close-btn" onClick={() => setModalFotoZoom(null)}>✕</button>
              </div>
              <img src={modalFotoZoom} alt="Visualização ampliada" className="modal-foto-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
