import { useEffect, useState, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../hooks/useToast'
import { pedidoService } from '../../features/cliente/services/pedidoService'
import { solicitacaoService } from '../../features/cliente/services/solicitacaoService'
import AccountTrigger from '../../components/session/AccountTrigger'
import MessengerDropdown from '../../components/chat/MessengerDropdown'
import './TopBar.css'

export interface NotificacaoItem {
  id: string
  tipo: 'avaliacao_incentivo' | 'pedido_status' | 'solicitacao_aberta' | 'solicitacao_cancelada'
  titulo: string
  mensagem: string
  rota: string
  data?: string
}

export default function TopBar() {
  const { usuario, perfilAtivo } = useSession()
  const { totalNaoLidas, dropdownAberto, toggleDropdown, marcarTodasComoLidas } = useChat()
  const toast = useToast()
  const navigate = useNavigate()

  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([])
  const [notificacoesCount, setNotificacoesCount] = useState<number>(0)
  const [notificacoesDropdownAberto, setNotificacoesDropdownAberto] = useState(false)
  const notificacoesDropdownRef = useRef<HTMLDivElement>(null)

  const isPrestador = perfilAtivo === 'PRESTADOR'
  const usuarioIdNum = usuario?.id && !isNaN(Number(usuario.id)) ? Number(usuario.id) : undefined

  const marcarNotificacoesComoLido = () => {
    setNotificacoesCount(0)
    const storageKey = isPrestador
      ? 'conecta_ultimas_notificacoes_pro_vistas'
      : 'conecta_ultimas_notificacoes_pedidos_vistas'
    localStorage.setItem(storageKey, new Date().toISOString())
  }

  // Fecha dropdown do sininho ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificacoesDropdownRef.current &&
        !notificacoesDropdownRef.current.contains(event.target as Node)
      ) {
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

  // Polling de Notificações Unificado (Cliente e Prestador)
  useEffect(() => {
    const token =
      localStorage.getItem('conecta.token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('conecta_token') ||
      localStorage.getItem('conecta.jwt')
    if (!token || !usuario?.id) {
      setNotificacoes([])
      setNotificacoesCount(0)
      return
    }

    let isMounted = true

    const verificarNotificacoes = async () => {
      try {
        const agora = Date.now()
        const umDiaMs = 24 * 60 * 60 * 1000
        const listaNotif: NotificacaoItem[] = []

        if (isPrestador) {
          // ==========================================
          // TAREFA 3: REGRAS DE NOTIFICAÇÃO PRESTADOR
          // ==========================================
          const storageKeyVistas = 'conecta_ultimas_notificacoes_pro_vistas'
          const ultimaVisualizacao = localStorage.getItem(storageKeyVistas)
          const dataCorte = ultimaVisualizacao ? new Date(ultimaVisualizacao).getTime() : 0

          try {
            const solicitacoes = await solicitacaoService.listarSolicitacoesPrestador(usuarioIdNum)
            if (!isMounted) return

            for (const s of solicitacoes) {
              const statusStr = (s.status || '').toUpperCase()
              const clienteNome = s.clienteNome || 'Cliente'
              const criadoMs = s.criadoEm ? new Date(s.criadoEm).getTime() : 0

              // 1. Alerta quando solicitação for criada (ABERTA ou AGUARDANDO_PROPOSTA)
              if (statusStr === 'ABERTA' || statusStr === 'AGUARDANDO_PROPOSTA') {
                const storageKeyToast = `notif_pro_solicitacao_${s.id}`
                const ultimoDisparo = localStorage.getItem(storageKeyToast)
                const podePularToast = !ultimoDisparo || agora - Number(ultimoDisparo) > umDiaMs

                listaNotif.push({
                  id: `sol_aberta_${s.id}`,
                  tipo: 'solicitacao_aberta',
                  titulo: 'Nova Solicitação de Orçamento',
                  mensagem: `${clienteNome}: "${s.titulo || s.descricao || 'Novo pedido recebido'}"`,
                  rota: `/pro/solicitacao/${s.id}`,
                })

                if (podePularToast && (!dataCorte || criadoMs > dataCorte)) {
                  toast.info(`Nova solicitação de orçamento de ${clienteNome}!`)
                  localStorage.setItem(storageKeyToast, agora.toString())
                }
              }

              // 2. Alerta quando solicitação for cancelada pelo cliente
              if (statusStr === 'CANCELADA') {
                listaNotif.push({
                  id: `sol_canc_${s.id}`,
                  tipo: 'solicitacao_cancelada',
                  titulo: 'Solicitação Cancelada',
                  mensagem: `${clienteNome} cancelou o pedido de orçamento "${s.titulo || 'Serviço'}".`,
                  rota: '/pro',
                })
              }
            }
          } catch {
            // Silencioso em caso de erro transitório de rede
          }
        } else {
          // ==========================================
          // REGRAS DE NOTIFICAÇÃO CLIENTE
          // ==========================================
          const storageKeyVistas = 'conecta_ultimas_notificacoes_pedidos_vistas'
          const ultimaVisualizacao = localStorage.getItem(storageKeyVistas)
          const dataCorte = ultimaVisualizacao ? new Date(ultimaVisualizacao).getTime() : 0

          try {
            const pedidos = await pedidoService.listarMeusPedidos()
            if (!isMounted) return

            // 1. Incentivo à avaliação para pedidos concluídos ainda não avaliados
            for (const p of pedidos) {
              const s = (p.status || '').toUpperCase()
              const isConcluido = s === 'CONCLUIDO' || s === 'FINALIZADO' || s === 'CONCLUIDA'
              const podeAvaliar = p.podeAvaliar ?? !p.jaAvaliado

              if (isConcluido && podeAvaliar) {
                const prestadorNome = p.prestadorNome || 'o profissional'
                const storageKey = `notificacao_avaliacao_${p.id}`
                const ultimoDisparo = localStorage.getItem(storageKey)
                const jaPassouUmDia = !ultimoDisparo || agora - Number(ultimoDisparo) > umDiaMs

                listaNotif.push({
                  id: `incentivo_${p.id}`,
                  tipo: 'avaliacao_incentivo',
                  titulo: 'Avalie sua experiência',
                  mensagem: `O serviço com ${prestadorNome} foi concluído! Como foi sua experiência? Clique aqui para avaliar.`,
                  rota: `/prestador/${p.prestadorId}`,
                })

                if (jaPassouUmDia) {
                  toast.info(
                    `O serviço com ${prestadorNome} foi concluído! Como foi sua experiência? Clique aqui para avaliar.`
                  )
                  localStorage.setItem(storageKey, agora.toString())
                }
              }
            }

            // 2. Alteração de status em pedidos recentes
            const alterados = pedidos.filter((p) => {
              const s = (p.status || '').toUpperCase()
              const isStatusInteresse =
                s === 'AGUARDANDO_ACEITE' ||
                s === 'PROPOSTA_RECEBIDA' ||
                s === 'ACEITO' ||
                s === 'ACEITA'
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
          } catch {
            // Silencioso em caso de erro transitório de rede
          }
        }

        if (isMounted) {
          setNotificacoes(listaNotif)
          setNotificacoesCount(listaNotif.length)
        }
      } catch {
        // Silencioso
      }
    }

    verificarNotificacoes()
    const interval = setInterval(verificarNotificacoes, 15000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [usuario?.id, isPrestador, usuarioIdNum])

  return (
    <header className="client-topbar">
      <div className="client-topbar-inner">
        {/* Marca / Logo Unificada com Chaveamento de Perfil */}
        <Link to={isPrestador ? '/pro' : '/'} className="client-brand">
          <div className="client-brand-logo">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill={isPrestador ? '#d97706' : '#0056D6'} />
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
            {isPrestador ? (
              <span className="pro-badge-topbar">PRO</span>
            ) : (
              <span className="client-brand-tag">Construções</span>
            )}
          </div>
        </Link>

        {/* Navegação Central Dinâmica baseada em Perfil */}
        <nav className="client-nav" aria-label="Navegação principal">
          {isPrestador ? (
            <>
              <NavLink
                to="/pro"
                end
                className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
              >
                Painel Pro
              </NavLink>
              <NavLink
                to="/pro/servicos"
                className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => marcarNotificacoesComoLido()}
              >
                Meus Serviços
              </NavLink>
              <NavLink
                to="/pro/portfolio"
                className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
              >
                Meu Portfólio
              </NavLink>
              <NavLink
                to="/pro/mensagens"
                className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => marcarTodasComoLidas()}
              >
                Mensagens
                {totalNaoLidas > 0 && (
                  <span className="client-badge-num" style={{ position: 'static', marginLeft: '4px' }}>
                    {totalNaoLidas}
                  </span>
                )}
              </NavLink>
            </>
          ) : (
            <>
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
                onClick={() => marcarNotificacoesComoLido()}
              >
                Meus Pedidos
                {notificacoesCount > 0 && (
                  <span className="client-badge-num" style={{ position: 'static', marginLeft: '4px' }}>
                    {notificacoesCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/mensagens"
                className={({ isActive }) => `client-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => marcarTodasComoLidas()}
              >
                Mensagens
                {totalNaoLidas > 0 && (
                  <span className="client-badge-num" style={{ position: 'static', marginLeft: '4px' }}>
                    {totalNaoLidas}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* Ações da Direita (Localização, Chat, Sininho e Conta) */}
        <div className="client-actions">
          <div className="client-location-pill" title="Região de Atendimento">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{isPrestador ? 'Tupã, SP' : 'São Paulo, SP'}</span>
          </div>

          {/* Botão de Mensagens (Balão do Chat com Badge Separada) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`client-icon-btn ${dropdownAberto ? 'active' : ''}`}
              onClick={() => {
                marcarTodasComoLidas()
                navigate(isPrestador ? '/pro/mensagens' : '/mensagens')
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                toggleDropdown()
              }}
              title="Mensagens (Clique para abrir, botão direito para menu rápido)"
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

          {/* Sininho de Notificações com Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`client-icon-btn client-icon-btn-sininho ${notificacoesDropdownAberto ? 'active' : ''}`}
              title="Notificações"
              aria-label="Notificações"
              onClick={() => {
                setNotificacoesDropdownAberto((prev) => !prev)
                if (notificacoesCount > 0) {
                  marcarNotificacoesComoLido()
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificacoesCount > 0 && (
                <span className="client-badge-num">{notificacoesCount}</span>
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
                        className={`notificacao-popover-item ${
                          item.tipo === 'avaliacao_incentivo'
                            ? 'item-avaliacao'
                            : item.tipo === 'solicitacao_cancelada'
                            ? 'item-urgente'
                            : ''
                        }`}
                        onClick={() => {
                          setNotificacoesDropdownAberto(false)
                          navigate(item.rota)
                        }}
                      >
                        <div
                          className={`notificacao-item-icon ${
                            item.tipo === 'avaliacao_incentivo'
                              ? 'icon-star'
                              : item.tipo === 'solicitacao_cancelada'
                              ? 'icon-warning'
                              : item.tipo === 'solicitacao_aberta'
                              ? 'icon-check'
                              : 'icon-bell'
                          }`}
                        >
                          {item.tipo === 'avaliacao_incentivo' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ) : item.tipo === 'solicitacao_cancelada' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                          ) : item.tipo === 'solicitacao_aberta' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="20 6 9 17 4 12" />
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

          {/* Widget da Conta do Usuário */}
          <AccountTrigger className="client-user-widget" title="Minha conta">
            <div className="client-user-avatar">
              {usuario?.fotoPerfilUrl ? (
                <img src={usuario.fotoPerfilUrl} alt={usuario.nome} />
              ) : (
                <span>{usuario?.nome ? usuario.nome[0].toUpperCase() : isPrestador ? 'P' : 'C'}</span>
              )}
            </div>
            <div className="client-user-meta">
              <span className="client-user-name">
                {usuario?.nome ? usuario.nome.split(' ')[0] : isPrestador ? 'Prestador' : 'Cliente'}
              </span>
              <span className="client-user-role">
                {isPrestador ? 'Prestador PRO' : 'Cliente'}
              </span>
            </div>
          </AccountTrigger>
        </div>
      </div>
    </header>
  )
}
