import { useChat } from '../../context/ChatContext'
import MessengerDropdown from './MessengerDropdown'
import './HeaderChatButton.css'

export default function HeaderChatButton() {
  const { toggleDropdown, totalNaoLidas, dropdownAberto } = useChat()

  return (
    <div className="header-chat-btn-wrapper">
      <button
        className={`header-chat-btn ${dropdownAberto ? 'active' : ''}`}
        onClick={toggleDropdown}
        title="Mensagens / Chat Conecta"
        aria-label="Abrir Mensagens"
      >
        {/* Ícone de Balão com Raio (Estilo Messenger) */}
        <svg width="20" height="20" viewBox="0 0 28 28" fill="currentColor">
          <path d="M14 2C7.373 2 2 7.142 2 13.486c0 3.612 1.745 6.84 4.47 8.948v3.566l3.418-1.876c1.28.355 2.656.548 4.112.548 6.627 0 12-5.142 12-11.486C26 7.142 20.627 2 14 2zm1.408 15.342l-3.328-3.55-6.502 3.55 7.15-7.592 3.407 3.55 6.423-3.55-7.15 7.592z" />
        </svg>

        {totalNaoLidas > 0 && (
          <span className="header-chat-badge">{totalNaoLidas}</span>
        )}
      </button>

      {/* Dropdown de Conversas */}
      <MessengerDropdown />
    </div>
  )
}
