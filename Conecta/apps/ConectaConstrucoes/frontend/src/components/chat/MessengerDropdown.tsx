import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import './MessengerDropdown.css'

export default function MessengerDropdown() {
  const navigate = useNavigate()
  const {
    dropdownAberto,
    setDropdownAberto,
    conversas,
    abrirChat,
  } = useChat()

  const [filtroAba, setFiltroAba] = useState<'tudo' | 'nao-lidas' | 'servicos'>('tudo')
  const [buscaTermo, setBuscaTermo] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Verifica se o clique não foi no botão que abre o dropdown
        const target = event.target as HTMLElement
        if (!target.closest('.header-chat-btn')) {
          setDropdownAberto(false)
        }
      }
    }

    if (dropdownAberto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownAberto, setDropdownAberto])

  if (!dropdownAberto) return null

  const conversasFiltradas = conversas.filter((c) => {
    const matchBusca =
      !buscaTermo.trim() ||
      c.nome.toLowerCase().includes(buscaTermo.toLowerCase()) ||
      c.profissao.toLowerCase().includes(buscaTermo.toLowerCase()) ||
      c.ultimaMensagem.toLowerCase().includes(buscaTermo.toLowerCase())

    if (!matchBusca) return false

    if (filtroAba === 'nao-lidas') return c.naoLida
    return true
  })

  return (
    <div className="messenger-dropdown-popover" ref={dropdownRef}>
      {/* Cabeçalho */}
      <div className="messenger-popover-header">
        <h3 className="messenger-popover-title">Conversas</h3>
        <div className="messenger-header-actions">
          <button className="messenger-icon-action" title="Opções">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          <button
            className="messenger-icon-action"
            title="Expandir para tela cheia"
            onClick={() => {
              setDropdownAberto(false)
              navigate('/chat')
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
          <button className="messenger-icon-action" title="Nova mensagem">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de Busca no Messenger */}
      <div className="messenger-search-bar">
        <span className="messenger-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="messenger-search-input"
          placeholder="Pesquisar no Messenger..."
          value={buscaTermo}
          onChange={(e) => setBuscaTermo(e.target.value)}
        />
        {buscaTermo && (
          <button className="messenger-clear-search" onClick={() => setBuscaTermo('')}>✕</button>
        )}
      </div>

      {/* Filtros em Pílulas */}
      <div className="messenger-filter-tabs">
        <button
          className={`messenger-tab-btn ${filtroAba === 'tudo' ? 'active' : ''}`}
          onClick={() => setFiltroAba('tudo')}
        >
          Tudo
        </button>
        <button
          className={`messenger-tab-btn ${filtroAba === 'nao-lidas' ? 'active' : ''}`}
          onClick={() => setFiltroAba('nao-lidas')}
        >
          Não lidas
        </button>
        <button
          className={`messenger-tab-btn ${filtroAba === 'servicos' ? 'active' : ''}`}
          onClick={() => setFiltroAba('servicos')}
        >
          Serviços
        </button>
      </div>

      {/* Lista de Conversas Recentes */}
      <div className="messenger-conversations-list">
        {conversasFiltradas.length === 0 ? (
          <div className="messenger-empty-state" style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 4px', fontSize: '14px' }}>Nenhuma conversa ativa</p>
            <span style={{ fontSize: '12px', lineHeight: '1.4' }}>Suas mensagens com prestadores e solicitações aparecerão aqui.</span>
          </div>
        ) : (
          conversasFiltradas.map((conv) => (
            <div
              key={conv.id}
              className={`messenger-conv-item ${conv.naoLida ? 'unread' : ''}`}
              onClick={() => abrirChat(conv.id)}
            >
              <div className="messenger-conv-avatar-wrap">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.nome} className="messenger-conv-avatar" />
                ) : (
                  <div className="messenger-conv-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                {conv.online && <span className="messenger-online-dot" title="Online agora" />}
              </div>

              <div className="messenger-conv-info">
                <div className="messenger-conv-top-line">
                  <span className="messenger-conv-name">{conv.nome}</span>
                  <span className="messenger-conv-time">{conv.tempo}</span>
                </div>
                <div className="messenger-conv-bottom-line">
                  <p className="messenger-conv-snippet">{conv.ultimaMensagem}</p>
                  {conv.naoLida && <span className="messenger-unread-dot" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rodapé do Dropdown */}
      <div className="messenger-popover-footer">
        <button
          className="messenger-see-all-btn"
          onClick={() => {
            setDropdownAberto(false)
            navigate('/chat')
          }}
        >
          Ver tudo no Messenger
        </button>
      </div>
    </div>
  )
}
