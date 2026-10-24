import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccountTrigger from '../components/session/AccountTrigger'
import './ChatPedido.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import quadroDisjuntores from '../assets/portfolio/quadro.jpg'

interface Mensagem {
  id: string
  remetente: 'usuario' | 'prestador'
  tipo: 'texto' | 'imagem' | 'proposta'
  texto?: string
  imagemUrl?: string
  imagemLegenda?: string
  hora: string
  statusEnvio?: string
}

export default function ChatPedido() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const pedidoNumero = id || '1042'

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      remetente: 'usuario',
      tipo: 'texto',
      texto:
        'Olá Carlos, boa tarde! Gostaria de confirmar se você consegue vir hoje verificar o disjuntor que está desarmando quando ligo o chuveiro.',
      hora: '14:15',
      statusEnvio: 'Entregue',
    },
    {
      id: '2',
      remetente: 'usuario',
      tipo: 'imagem',
      imagemUrl: quadroDisjuntores,
      imagemLegenda: 'quadro_disjuntores.jpg',
      hora: '14:16',
      statusEnvio: 'Entregue',
    },
    {
      id: '3',
      remetente: 'prestador',
      tipo: 'texto',
      texto:
        'Boa tarde, Matheus! Consigo sim, estou com a agenda livre a partir das 16h. Pelas fotos parece ser um disjuntor de 30A subdimensionado para o chuveiro atual.',
      hora: '14:20',
    },
    {
      id: '4',
      remetente: 'prestador',
      tipo: 'proposta',
      hora: '14:22',
    },
  ])

  const [novoTexto, setNovoTexto] = useState('')
  const [propostaStatus, setPropostaStatus] = useState<'pendente' | 'aprovada' | 'recusada'>('pendente')
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const handleEnviarMensagem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoTexto.trim()) return

    const now = new Date()
    const horaFormatada = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const novaMsg: Mensagem = {
      id: Date.now().toString(),
      remetente: 'usuario',
      tipo: 'texto',
      texto: novoTexto.trim(),
      hora: horaFormatada,
      statusEnvio: 'Entregue',
    }

    setMensagens((prev) => [...prev, novaMsg])
    setNovoTexto('')

    // Simula resposta automática do Carlos Silva após 1.5s
    setTimeout(() => {
      const respostaCarlos: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: 'prestador',
        tipo: 'texto',
        texto: 'Perfeito! Já separei as ferramentas e o disjuntor de 40A. Qualquer detalhe adicional pode me avisar aqui.',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMensagens((prev) => [...prev, respostaCarlos])
    }, 1500)
  }

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  return (
    <div className="chat-viewport">
      <div className="chat-container">
        {/* Top Header Global Responsivo */}
        <header className="chat-global-header">
          <div className="header-inner">
            <Link to="/" className="home-brand">
              <div className="home-brand-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="9" fill="#0056D6" />
                  <path
                    d="M9 16.5L13.5 21L23 11.5"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="home-brand-text">
                <span className="home-title">Início</span>
              </div>
            </Link>

            <nav className="desktop-nav">
              <Link to="/" className="desktop-nav-link">Início</Link>
              <Link to="/busca" className="desktop-nav-link">Buscar Serviços</Link>
              <Link to="/pedidos" className="desktop-nav-link active">Meus Pedidos</Link>
            </nav>

            <div className="home-header-actions">
              <button className="header-action-btn" title="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="header-badge-dot" />
              </button>
              <AccountTrigger className="user-avatar-btn" title="Minha conta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </AccountTrigger>
            </div>
          </div>
        </header>

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
              <img src={carlosAvatar} alt="Carlos Silva" className="chat-prestador-avatar" />
              <span className="chat-online-badge" title="Online agora" />
            </div>

            <div className="chat-prestador-meta">
              <div className="chat-prestador-nome-row">
                <span className="chat-prestador-name">Carlos Silva</span>
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
              title="Ligar para Carlos Silva"
              onClick={() => alert('Ligação direta iniciada com Carlos Silva')}
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
              <span className="sticky-servico-resumo">Troca de fiação do chuveiro e disjuntores</span>
            </div>
          </div>

          <div className="sticky-banner-right">
            <div className="sticky-valor-col">
              <span className="sticky-valor-hint">Valor</span>
              <strong className="sticky-valor-amount">R$ 180</strong>
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

          {/* Mensagens */}
          {mensagens.map((msg) => {
            if (msg.remetente === 'usuario') {
              return (
                <div key={msg.id} className="msg-row msg-row-user">
                  <div className="msg-bubble-user">
                    {msg.tipo === 'texto' && <p className="msg-user-text">{msg.texto}</p>}

                    {msg.tipo === 'imagem' && (
                      <div
                        className="msg-user-image-wrap"
                        onClick={() => setModalFotoZoom(msg.imagemUrl || quadroDisjuntores)}
                        title="Clique para ampliar"
                      >
                        <img
                          src={msg.imagemUrl || quadroDisjuntores}
                          alt="Foto anexada"
                          className="msg-attached-img"
                        />
                        <div className="img-attachment-label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>{msg.imagemLegenda}</span>
                        </div>
                      </div>
                    )}

                    <div className="msg-meta-row">
                      <span className="msg-time">{msg.hora}</span>
                      {msg.statusEnvio && (
                        <>
                          <span className="msg-meta-dot">•</span>
                          <span className="msg-status">{msg.statusEnvio}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            // Remetente: Prestador (Carlos Silva)
            return (
              <div key={msg.id} className="msg-row msg-row-prestador">
                <img src={carlosAvatar} alt="Carlos Silva" className="msg-prestador-avatar" />

                <div className="msg-prestador-content">
                  {msg.tipo === 'texto' && (
                    <div className="msg-bubble-prestador">
                      <p className="msg-prestador-text">{msg.texto}</p>
                      <span className="msg-time-left">{msg.hora}</span>
                    </div>
                  )}

                  {msg.tipo === 'proposta' && (
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
          })}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Inferior de Chat */}
        <form className="chat-input-bar" onSubmit={handleEnviarMensagem}>
          <button
            type="button"
            className="chat-attach-btn"
            title="Anexar foto ou arquivo"
            onClick={() => alert('Abrindo seletor de imagens...')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input
            type="text"
            className="chat-text-input"
            placeholder="Digite uma mensagem para Carlos..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
          />

          <button type="submit" className="chat-send-btn" title="Enviar Mensagem">
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
