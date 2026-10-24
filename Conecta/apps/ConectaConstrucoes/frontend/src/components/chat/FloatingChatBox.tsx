import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import './FloatingChatBox.css'

export default function FloatingChatBox() {
  const navigate = useNavigate()
  const {
    chatJanelaAtiva,
    isMinimizado,
    fecharJanela,
    minimizarJanela,
    restaurarJanela,
    enviarMensagem,
  } = useChat()

  const [textoInput, setTextoInput] = useState('')
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatJanelaAtiva && !isMinimizado) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatJanelaAtiva?.mensagens, isMinimizado])

  if (!chatJanelaAtiva) return null

  // Modo Minimizado (Chat Head flutuante)
  if (isMinimizado) {
    return (
      <div
        className="messenger-chat-head"
        onClick={restaurarJanela}
        title={`Abrir conversa com ${chatJanelaAtiva.nome}`}
      >
        <img
          src={chatJanelaAtiva.avatar}
          alt={chatJanelaAtiva.nome}
          className="messenger-chat-head-avatar"
        />
        {chatJanelaAtiva.online && <span className="messenger-chat-head-online" />}
        <button
          className="messenger-chat-head-close"
          onClick={(e) => {
            e.stopPropagation()
            fecharJanela()
          }}
          title="Fechar"
        >
          ✕
        </button>
      </div>
    )
  }

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textoInput.trim()) return
    enviarMensagem(chatJanelaAtiva.id, textoInput)
    setTextoInput('')
  }

  const handleEnviarLike = () => {
    enviarMensagem(chatJanelaAtiva.id, '👍')
  }

  return (
    <div className="messenger-docked-chatbox">
      {/* Topo da Janelinha Flutuante */}
      <div className="docked-header">
        <div className="docked-header-left" onClick={() => navigate(`/prestador/${chatJanelaAtiva.prestadorId}`)} style={{ cursor: 'pointer' }}>
          <div className="docked-avatar-wrap">
            <img
              src={chatJanelaAtiva.avatar}
              alt={chatJanelaAtiva.nome}
              className="docked-avatar"
            />
            {chatJanelaAtiva.online && <span className="docked-online-dot" />}
          </div>
          <div className="docked-user-meta">
            <div className="docked-user-name-row">
              <span className="docked-user-name">{chatJanelaAtiva.nome}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#0056D6">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="docked-user-status">Online agora</span>
          </div>
        </div>

        <div className="docked-header-actions">
          <button
            className="docked-btn-action"
            title="Ligação de voz"
            onClick={() => alert(`Ligando para ${chatJanelaAtiva.nome}...`)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>

          <button
            className="docked-btn-action"
            title="Chamada de vídeo"
            onClick={() => alert(`Iniciando chamada de vídeo com ${chatJanelaAtiva.nome}...`)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>

          <button
            className="docked-btn-action"
            title="Minimizar"
            onClick={minimizarJanela}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button
            className="docked-btn-action"
            title="Fechar"
            onClick={fecharJanela}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Corpo com Mensagens */}
      <div className="docked-messages-body">
        {/* Banner Conecta Protege */}
        <div className="docked-security-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Conversa protegida pela Garantia Conecta Protege.</span>
        </div>

        {chatJanelaAtiva.mensagens.map((msg) => {
          if (msg.remetente === 'usuario') {
            return (
              <div key={msg.id} className="docked-msg-row docked-msg-user">
                <div className="docked-bubble-user">
                  {msg.texto && <p>{msg.texto}</p>}
                  {msg.imagemUrl && (
                    <div
                      className="docked-img-wrap"
                      onClick={() => setModalFotoZoom(msg.imagemUrl || '')}
                      title="Clique para ampliar"
                    >
                      <img src={msg.imagemUrl} alt="Anexo" className="docked-attached-img" />
                      <span className="docked-img-label">{msg.imagemLegenda || 'foto.jpg'}</span>
                    </div>
                  )}
                  <span className="docked-time-sub">{msg.hora}</span>
                </div>
              </div>
            )
          }

          // Prestador
          return (
            <div key={msg.id} className="docked-msg-row docked-msg-prestador">
              <img src={chatJanelaAtiva.avatar} alt="" className="docked-bubble-avatar" />
              <div className="docked-bubble-wrapper">
                {msg.texto && (
                  <div className="docked-bubble-prestador">
                    <p>{msg.texto}</p>
                    <span className="docked-time-sub-left">{msg.hora}</span>
                  </div>
                )}

                {msg.isProposta && (
                  <div className="docked-proposta-card">
                    <div className="docked-proposta-badge">Proposta Formalizada</div>
                    <h5 className="docked-proposta-title">Troca de Disjuntor 40A</h5>
                    <ul className="docked-proposta-list">
                      <li>✓ Norma NBR 5410</li>
                      <li>✓ Revisão e aperto 6mm²</li>
                      <li>✓ Garantia 90 dias</li>
                    </ul>
                    <div className="docked-proposta-price">R$ 180,00</div>
                    <button
                      className="docked-btn-aprovar"
                      onClick={() => {
                        fecharJanela()
                        navigate(`/pedidos/${chatJanelaAtiva.pedidoNumero || '1042'}`)
                      }}
                    >
                      Ver Pedido & Pagar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div ref={chatScrollRef} />
      </div>

      {/* Barra Inferior estilo Messenger */}
      <form className="docked-input-footer" onSubmit={handleEnviar}>
        <div className="docked-tools-row">
          <button
            type="button"
            className="docked-tool-btn"
            title="Enviar áudio"
            onClick={() => alert('Gravação de áudio iniciada...')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </button>

          <button
            type="button"
            className="docked-tool-btn"
            title="Anexar foto"
            onClick={() => alert('Abrindo galeria de fotos...')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          <button
            type="button"
            className="docked-tool-btn"
            title="Figurinhas"
            onClick={() => setTextoInput((prev) => prev + ' 🛠️')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
        </div>

        <div className="docked-input-wrapper">
          <input
            type="text"
            className="docked-text-field"
            placeholder="Aa"
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
          />
          <button
            type="button"
            className="docked-emoji-btn"
            onClick={() => setTextoInput((prev) => prev + ' 😊')}
            title="Emoji"
          >
            😊
          </button>
        </div>

        {textoInput.trim() ? (
          <button type="submit" className="docked-btn-send" title="Enviar mensagem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0056D6">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="docked-btn-like"
            title="Enviar curtida"
            onClick={handleEnviarLike}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0056D6">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
        )}
      </form>

      {/* Modal Zoom Foto */}
      {modalFotoZoom && (
        <div className="docked-modal-zoom-overlay" onClick={() => setModalFotoZoom(null)}>
          <div className="docked-modal-zoom-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalFotoZoom} alt="Ampliada" className="docked-modal-zoom-img" />
            <button className="docked-modal-zoom-close" onClick={() => setModalFotoZoom(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
