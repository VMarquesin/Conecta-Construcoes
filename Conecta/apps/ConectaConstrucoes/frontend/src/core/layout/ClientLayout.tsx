import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../hooks/useToast'
import { pedidoService } from '../../features/cliente/services/pedidoService'
import AccountTrigger from '../../components/session/AccountTrigger'
import MessengerDropdown from '../../components/chat/MessengerDropdown'
import './ClientLayout.css'

export interface NotificacaoItem {
  id: string
  tipo: 'avaliacao_incentivo' | 'pedido_status'
  titulo: string
  mensagem: string
  rota: string
  data?: string
}

export default function ClientLayout() {
  const { usuario } = useSession()
  const { totalNaoLidas, dropdownAberto, toggleDropdown, marcarTodasComoLidas } = useChat()
  const toast = useToast()
  const navigate = useNavigate()

  // Tarefa 1 & 2: Notificações do Sininho e Lembretes de Avaliação
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([])
  const [notificacoesPedidosCount, setNotificacoesPedidosCount] = useState<number>(0)
  const [notificacoesDropdownAberto, setNotificacoesDropdownAberto] = useState(false)
  const notificacoesDropdownRef = useRef<HTMLDivElement>(null)

  const marcarNotificacoesPedidosComoLido = () => {
    setNotificacoesPedidosCount(0)
    localStorage.setItem('conecta_ultimas_notificacoes_pedidos_vistas', new Date().toISOString())
  }

  // Fecha dropdown do sininho ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificacoesDropdownRef.current && !notificacoesDropdownRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('.client-icon-btn-sininho')) {
          setNotificacoesDropdownAberto(false)
        }
      }
    }

    if (notificacoesDropdownAberto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificacoesDropdownAberto])

  useEffect(() => {
    if (!usuario?.id) return

    let isMounted = true
    const verificarAtualizacoesPedidos = () => {
      pedidoService
        .listarMeusPedidos()
        .then((pedidos) => {
          if (!isMounted) return
          const ultimaVisualizacao = localStorage.getItem('conecta_ultimas_notificacoes_pedidos_vistas')
          const dataCorte = ultimaVisualizacao ? new Date(ultimaVisualizacao).getTime() : 0
          const agora = Date.now()
          const umDiaMs = 24 * 60 * 60 * 1000

          const listaNotif: NotificacaoItem[] = []

          // TAREFA 2: Verifica pedidos CONCLUIDO que ainda não foram avaliados
          for (const p of pedidos) {
            const s = (p.status || '').toUpperCase()
            const isConcluido = s === 'CONCLUIDO' || s === 'FINALIZADO' || s === 'CONCLUIDA'
            const podeAvaliar = p.podeAvaliar ?? !p.jaAvaliado

            if (isConcluido && podeAvaliar) {
              const prestadorNome = p.prestadorNome || 'o profissional'
              const storageKey = `notificacao_avaliacao_${p.id}`
              const ultimoDisparo = localStorage.getItem(storageKey)
              const jaPassouUmDia = !ultimoDisparo || agora - Number(ultimoDisparo) > umDiaMs

              // Adiciona ao array do "Sininho"
              listaNotif.push({
                id: `incentivo_${p.id}`,
                tipo: 'avaliacao_incentivo',
                titulo: 'Avalie seu atendimento',
                mensagem: `O serviço com ${prestadorNome} foi concluído! Como foi sua experiência? Clique aqui para avaliar.`,
                rota: `/prestador/${p.prestadorId}`,
              })

              // Pula na tela (toast) apenas 1 vez ao dia para evitar spam
              if (jaPassouUmDia) {
                toast.info(
                  `O serviço com ${prestadorNome} foi concluído! Como foi sua experiência? Clique aqui para avaliar.`
                )
                localStorage.setItem(storageKey, agora.toString())
              }
            }
          }

          // Notificações estritas de pedidos que necessitam atenção ou tiveram alteração de status
          const alterados = pedidos.filter((p) => {
            const s = (p.status || '').toUpperCase()
            const isStatusInteresse = s === 'AGUARDANDO_ACEITE' || s === 'PROPOSTA_RECEBIDA' || s === 'ACEITO' || s === 'ACEITA'
            if (!isStatusInteresse) return false
            if (!dataCorte) return true
            const dataPedido = p.solicitadoEm ? new Date(p.solicitadoEm).getTime() : 0
            return dataPedido > dataCorte
          })

          for (const p of alterados) {
            listaNotif.push({
              id: `pedido_${p.id}`,
              tipo: 'pedido_status',
              titulo: `Pedido #${p.id} atualizado`,
              mensagem: `${p.statusTexto}: ${p.tituloServico}`,
              rota: `/pedidos/${p.id}`,
            })
          }

          setNotificacoes(listaNotif)
          setNotificacoesPedidosCount(listaNotif.length)
        })
        .catch(() => {
          // Silencioso em caso de erro de rede transitório
        })
    }

    verificarAtualizacoesPedidos()
    const interval = setInterval(verificarAtualizacoesPedidos, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [usuario?.id])

  return (
    <div className="client-shell">
      {/* TopBar Unificada Global */}
      <header className="client-topbar">
        <div className="client-topbar-inner">
          {/* Marca / Logo */}
          <Link to="/" className="client-brand">
            <div className="client-brand-logo">
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
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
            <div className="client-brand-text">
              <span className="client-title">Conecta</span>
              <span className="client-brand-tag">Construções</span>
            </div>
          </Link>

          {/* Navegação Central */}
          <nav className="client-nav" aria-label="Navegação principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
            >
              Início
            </NavLink>
            <NavLink
              to="/busca"
              className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
            >
              Buscar Serviços
            </NavLink>
            <NavLink
              to="/pedidos"
              className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                marcarNotificacoesPedidosComoLido()
              }}
            >
              Meus Pedidos
              {notificacoesPedidosCount > 0 && (
                <span className="client-badge-num" style={{ position: 'static', marginLeft: '4px' }}>
                  {notificacoesPedidosCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/mensagens"
              className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                marcarTodasComoLidas()
              }}
            >
              Mensagens
              {totalNaoLidas > 0 && (
                <span className="client-badge-num" style={{ position: 'static', marginLeft: '4px' }}>
                  {totalNaoLidas}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Ações da Direita */}
          <div className="client-actions">
            <div className="client-location-pill" title="Localização selecionada">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>São Paulo, SP</span>
            </div>

            {/* Botão Mensagens: exibe contagem de MENSAGENS NÃO LIDAS e zera ao clicar */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`client-icon-btn ${dropdownAberto ? 'active' : ''}`}
                onClick={() => {
                  marcarTodasComoLidas()
                  navigate('/mensagens')
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  toggleDropdown()
                }}
                title="Mensagens (Clique para ver todas, botão direito para menu rápido)"
                aria-label="Mensagens não lidas"
              >
                <svg width="20" height="20" viewBox="0 0 28 28" fill="currentColor">
                  <path d="M14 2C7.373 2 2 7.142 2 13.486c0 3.612 1.745 6.84 4.47 8.948v3.566l3.418-1.876c1.28.355 2.656.548 4.112.548 6.627 0 12-5.142 12-11.486C26 7.142 20.627 2 14 2zm1.408 15.342l-3.328-3.55-6.502 3.55 7.15-7.592 3.407 3.55 6.423-3.55-7.15 7.592z" />
                </svg>
                {totalNaoLidas > 0 && (
                  <span className="client-badge-num">{totalNaoLidas}</span>
                )}
              </button>
              <MessengerDropdown />
            </div>

            {/* Sininho de Notificações com Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`client-icon-btn client-icon-btn-sininho ${notificacoesDropdownAberto ? 'active' : ''}`}
                title="Notificações"
                aria-label="Notificações"
                onClick={() => {
                  setNotificacoesDropdownAberto((prev) => !prev)
                  if (notificacoesPedidosCount > 0) {
                    marcarNotificacoesPedidosComoLido()
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notificacoesPedidosCount > 0 && (
                  <span className="client-badge-num">{notificacoesPedidosCount}</span>
                )}
              </button>

              {notificacoesDropdownAberto && (
                <div className="notificacoes-dropdown-popover" ref={notificacoesDropdownRef}>
                  <div className="notificacoes-popover-header">
                    <h3 className="notificacoes-popover-title">Notificações</h3>
                    <span className="notificacoes-count-hint">{notificacoes.length} no total</span>
                  </div>

                  <div className="notificacoes-popover-list">
                    {notificacoes.length === 0 ? (
                      <div className="notificacoes-empty">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span>Nenhuma notificação nova no momento.</span>
                      </div>
                    ) : (
                      notificacoes.map((item) => (
                        <div
                          key={item.id}
                          className={`notificacao-popover-item ${item.tipo === 'avaliacao_incentivo' ? 'item-avaliacao' : ''}`}
                          onClick={() => {
                            setNotificacoesDropdownAberto(false)
                            navigate(item.rota)
                          }}
                        >
                          <div className={`notificacao-item-icon ${item.tipo === 'avaliacao_incentivo' ? 'icon-star' : 'icon-bell'}`}>
                            {item.tipo === 'avaliacao_incentivo' ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                          </div>
                          <div className="notificacao-item-body">
                            <span className="notificacao-item-title">{item.titulo}</span>
                            <p className="notificacao-item-msg">{item.mensagem}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Widget do Perfil do Usuário */}
            <AccountTrigger className="client-user-widget" title="Minha conta">
              <div className="client-user-avatar">
                {usuario?.fotoPerfilUrl ? (
                  <img src={usuario.fotoPerfilUrl} alt={usuario.nome} />
                ) : (
                  <span>{usuario?.nome ? usuario.nome[0].toUpperCase() : 'C'}</span>
                )}
              </div>
              <div className="client-user-meta">
                <span className="client-user-name">
                  {usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário'}
                </span>
                <span className="client-user-role">Cliente</span>
              </div>
            </AccountTrigger>
          </div>
        </div>
      </header>

      {/* Conteúdo Renderizado das Rotas Filhas */}
      <main className="client-content">
        <Outlet />
      </main>
    </div>
  )
}
