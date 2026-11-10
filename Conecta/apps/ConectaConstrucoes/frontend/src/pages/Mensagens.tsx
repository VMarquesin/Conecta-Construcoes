import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { chatService, type ConversaResponse, type MensagemItemResponse } from '../features/cliente/services/chatService'
import './Mensagens.css'

export default function MensagensPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [conversas, setConversas] = useState<ConversaResponse[]>([])
  const [loadingConversas, setLoadingConversas] = useState(true)
  const [busca, setBusca] = useState('')

  // Conversa ativa selecionada
  const [conversaAtiva, setConversaAtiva] = useState<ConversaResponse | null>(null)
  const [mensagens, setMensagens] = useState<MensagemItemResponse[]>([])
  const [loadingMensagens, setLoadingMensagens] = useState(false)
  const [novoTexto, setNovoTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  const chatScrollRef = useRef<HTMLDivElement>(null)

  // 1. Carrega todas as conversas ativas do usuário ao montar
  useEffect(() => {
    let cancel = false
    setLoadingConversas(true)
    chatService
      .listarConversas()
      .then((data) => {
        if (!cancel) {
          setConversas(data)
          // Se tiver um ID na URL, seleciona essa conversa
          if (id) {
            const found = data.find((c) => String(c.conversaId || c.id) === String(id) || String(c.prestadorId) === String(id))
            if (found) setConversaAtiva(found)
          } else if (data.length > 0) {
            // Seleciona a primeira por padrão em telas grandes
            if (window.innerWidth > 768) {
              setConversaAtiva(data[0])
            }
          }
        }
      })
      .catch((err) => console.error('Erro ao listar conversas:', err))
      .finally(() => {
        if (!cancel) setLoadingConversas(false)
      })

    return () => {
      cancel = true
    }
  }, [id])

  // 2. Quando mudar a conversa ativa, faz GET /api/v1/conversas/{id}/mensagens e carrega histórico real
  useEffect(() => {
    if (!conversaAtiva) {
      setMensagens([])
      return
    }

    const conversaId = conversaAtiva.conversaId || Number(conversaAtiva.id)
    if (!conversaId) return

    let cancel = false
    setLoadingMensagens(true)

    chatService
      .listarMensagens(conversaId)
      .then((data) => {
        if (!cancel) {
          setMensagens(data || [])
        }
      })
      .catch((err) => {
        console.error(`Erro ao carregar mensagens da conversa #${conversaId}:`, err)
        if (!cancel) setMensagens([])
      })
      .finally(() => {
        if (!cancel) setLoadingMensagens(false)
      })

    return () => {
      cancel = true
    }
  }, [conversaAtiva?.conversaId, conversaAtiva?.id])

  // Scroll para o fim sempre que chegar nova mensagem
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, loadingMensagens])

  // 3. Ao enviar mensagem: POST na API aguardando retorno 200/201 antes de consolidar no array
  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoTexto.trim() || !conversaAtiva || enviando) return

    const texto = novoTexto.trim()
    const conversaId = conversaAtiva.conversaId || Number(conversaAtiva.id)
    if (!conversaId) return

    setEnviando(true)

    try {
      const msgRetornada = await chatService.enviarMensagem(conversaId, { texto })
      // Sucesso garantido da API
      setMensagens((prev) => [...prev, msgRetornada])
      setNovoTexto('')

      // Atualiza o snippet da conversa na lista lateral
      setConversas((prev) =>
        prev.map((c) =>
          c.id === conversaAtiva.id || c.conversaId === conversaAtiva.conversaId
            ? { ...c, ultimaMensagem: texto, tempo: 'Agora' }
            : c
        )
      )
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err)
      alert(err.message || 'Erro ao enviar a mensagem para o prestador.')
    } finally {
      setEnviando(false)
    }
  }

  const conversasFiltradas = conversas.filter((c) => {
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return (
      (c.nome && c.nome.toLowerCase().includes(termo)) ||
      (c.profissao && c.profissao.toLowerCase().includes(termo)) ||
      (c.ultimaMensagem && c.ultimaMensagem.toLowerCase().includes(termo))
    )
  })

  return (
    <div className="mensagens-page">
      {/* 1. Barra Lateral com as Conversas */}
      <aside className={`mensagens-sidebar ${conversaAtiva ? 'hide-mobile' : ''}`}>
        <div className="mensagens-sidebar-header">
          <h2 className="mensagens-sidebar-title">Mensagens</h2>
          <div className="mensagens-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="mensagens-search-input"
              placeholder="Pesquisar conversas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="mensagens-list">
          {loadingConversas ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
              <p>Carregando conversas...</p>
            </div>
          ) : conversasFiltradas.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ margin: '0 auto 10px' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h4 style={{ margin: '0 0 4px', color: '#1e293b' }}>Nenhuma conversa</h4>
              <p style={{ fontSize: '13px', margin: 0 }}>Suas mensagens com profissionais aparecerão aqui.</p>
            </div>
          ) : (
            conversasFiltradas.map((conv) => {
              const isSelected =
                conversaAtiva &&
                (conversaAtiva.id === conv.id || conversaAtiva.conversaId === conv.conversaId)

              return (
                <div
                  key={conv.id || conv.conversaId}
                  className={`conversa-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setConversaAtiva(conv)
                    navigate(`/mensagens/${conv.conversaId || conv.id}`, { replace: true })
                  }}
                >
                  <div className="conversa-avatar-wrap">
                    {conv.avatar ? (
                      <img src={conv.avatar} alt={conv.nome} className="conversa-avatar" />
                    ) : (
                      <div className="conversa-avatar-placeholder">
                        {conv.nome ? conv.nome[0].toUpperCase() : 'P'}
                      </div>
                    )}
                    {conv.online && <span className="conversa-online-dot" title="Online" />}
                  </div>

                  <div className="conversa-info">
                    <div className="conversa-top-row">
                      <span className="conversa-name">{conv.nome || 'Profissional'}</span>
                      <span className="conversa-time">{conv.tempo}</span>
                    </div>
                    <div className="conversa-sub-row">
                      <p className="conversa-snippet">
                        {conv.ultimaMensagem || conv.profissao || 'Iniciar conversa'}
                      </p>
                      {conv.naoLida && <span className="conversa-unread-pill" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* 2. Painel Central com o Histórico e Input de Chat */}
      <section className={`mensagens-chat-panel ${!conversaAtiva ? 'hide-mobile' : ''}`}>
        {conversaAtiva ? (
          <>
            {/* Topo do Chat */}
            <div className="chat-panel-header">
              <div className="chat-panel-header-left">
                <button
                  type="button"
                  className="client-icon-btn"
                  onClick={() => setConversaAtiva(null)}
                  title="Voltar às conversas"
                  style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>

                <div className="conversa-avatar-wrap" style={{ width: '42px', height: '42px' }}>
                  {conversaAtiva.avatar ? (
                    <img src={conversaAtiva.avatar} alt={conversaAtiva.nome} className="conversa-avatar" />
                  ) : (
                    <div className="conversa-avatar-placeholder">
                      {conversaAtiva.nome ? conversaAtiva.nome[0].toUpperCase() : 'P'}
                    </div>
                  )}
                  {conversaAtiva.online && <span className="conversa-online-dot" />}
                </div>

                <div>
                  <div className="chat-panel-prof-name">
                    <span>{conversaAtiva.nome}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#0056D6">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="chat-panel-prof-role">{conversaAtiva.profissao || 'Prestador Verificado'}</p>
                </div>
              </div>

              <div className="chat-panel-header-actions">
                <Link
                  to={`/prestador/${conversaAtiva.prestadorId}`}
                  className="chat-panel-btn"
                  title="Ver perfil completo do profissional"
                >
                  Ver Perfil
                </Link>
                {conversaAtiva.pedidoNumero && (
                  <Link
                    to={`/pedidos/${conversaAtiva.pedidoNumero}`}
                    className="chat-panel-btn"
                    style={{ background: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' }}
                  >
                    Pedido #{conversaAtiva.pedidoNumero}
                  </Link>
                )}
              </div>
            </div>

            {/* Mensagens com scroll automático */}
            <div className="chat-messages-container">
              {loadingMensagens ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <p>Carregando histórico de mensagens...</p>
                </div>
              ) : mensagens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <p>Nenhuma mensagem trocada ainda.</p>
                  <p style={{ fontSize: '13px' }}>Diga olá para {conversaAtiva.nome} e tire dúvidas sobre o serviço!</p>
                </div>
              ) : (
                mensagens.map((m) => (
                  <div key={m.id} className={`msg-bubble ${m.remetente}`}>
                    {m.texto && <div>{m.texto}</div>}
                    {m.hora && <span className="msg-time">{m.hora}</span>}
                  </div>
                ))
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Barra de envio de mensagem */}
            <form className="chat-input-bar" onSubmit={handleEnviar}>
              <input
                type="text"
                className="chat-input-field"
                placeholder={`Mensagem para ${conversaAtiva.nome}...`}
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                disabled={enviando}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!novoTexto.trim() || enviando}
                title="Enviar mensagem"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty-panel">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Suas Conversas</h3>
            <p style={{ maxWidth: '360px', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Selecione uma conversa ao lado para ver o histórico de mensagens e negociar orçamentos diretamente com o prestador.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
