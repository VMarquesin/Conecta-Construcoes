import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import HeaderChatButton from '../components/chat/HeaderChatButton'
import AccountTrigger from '../components/session/AccountTrigger'
import './Busca.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import lucasAvatar from '../assets/avatars/lucas.jpg'
import julianaAvatar from '../assets/avatars/juliana.jpg'
import marianaAvatar from '../assets/avatars/mariana.jpg'
import robertoAvatar from '../assets/avatars/roberto.jpg'
import anaAvatar from '../assets/avatars/ana.jpg'

interface ProfissionalBusca {
  id: number
  nome: string
  avatar: string
  destaqueRegiao?: boolean
  tipoBadge: 'verificado' | 'super'
  badgeTexto: string
  profissao: string
  avaliacao: number
  numAvaliacoes: number
  distanciaTexto: string
  tags: string[]
  precoTexto: string
  precoLabel: string
  categoria: string
  temChat?: boolean
}

const PROFISSIONAIS_BUSCA: ProfissionalBusca[] = [
  {
    id: 1,
    nome: 'Carlos Silva',
    avatar: carlosAvatar,
    destaqueRegiao: true,
    tipoBadge: 'verificado',
    badgeTexto: 'Verificado',
    profissao: 'Eletricista Residencial & Comercial',
    avaliacao: 4.9,
    numAvaliacoes: 128,
    distanciaTexto: 'a 1.8 km de você • Atende até 15 km',
    tags: ['Quadro de luz', 'Fiação completa', 'Instalação de chuveiro e luminárias'],
    precoLabel: 'A partir de',
    precoTexto: 'R$ 90/hora',
    categoria: 'eletrica',
    temChat: true,
  },
  {
    id: 2,
    nome: 'Lucas Ferreira',
    avatar: lucasAvatar,
    tipoBadge: 'super',
    badgeTexto: 'Superprestador',
    profissao: 'Instalações Elétricas & Reparos de Emergência',
    avaliacao: 5.0,
    numAvaliacoes: 89,
    distanciaTexto: 'a 2.2 km de você • Atendimento emergencial 24h',
    tags: ['Plantão 24h', 'Troca de disjuntores', 'Tomadas e interruptores'],
    precoLabel: 'Valor base',
    precoTexto: 'R$ 95/hora',
    categoria: 'eletrica',
    temChat: false,
  },
  {
    id: 3,
    nome: 'Juliana Mendes',
    avatar: julianaAvatar,
    tipoBadge: 'verificado',
    badgeTexto: 'Verificada',
    profissao: 'Eletricista & Iluminação Decorativa',
    avaliacao: 4.9,
    numAvaliacoes: 64,
    distanciaTexto: 'a 4.1 km de você • Projetos customizados',
    tags: ['Fitas de LED', 'Projetos luminotécnicos', 'Cabeamento estruturado'],
    precoLabel: 'A partir de',
    precoTexto: 'R$ 100/hora',
    categoria: 'eletrica',
    temChat: false,
  },
  {
    id: 4,
    nome: 'Mariana Costa',
    avatar: marianaAvatar,
    tipoBadge: 'super',
    badgeTexto: 'Superprestadora',
    profissao: 'Pintora & Acabamentos Especiais',
    avaliacao: 5.0,
    numAvaliacoes: 94,
    distanciaTexto: 'a 2.5 km de você • Atende toda a zona metropolitana',
    tags: ['Pintura epóxi', 'Texturas e massas', 'Acabamentos finos'],
    precoLabel: 'Valor base',
    precoTexto: 'R$ 110/hora',
    categoria: 'pintura',
    temChat: true,
  },
  {
    id: 5,
    nome: 'Roberto Mendes',
    avatar: robertoAvatar,
    tipoBadge: 'verificado',
    badgeTexto: 'Verificado',
    profissao: 'Encanador & Desentupimento Especializado',
    avaliacao: 4.8,
    numAvaliacoes: 210,
    distanciaTexto: 'a 3.1 km de você • Plantão para vazamentos',
    tags: ['Caça-vazamentos', 'Desentupimentos', 'Troca de registros'],
    precoLabel: 'A partir de',
    precoTexto: 'R$ 85/hora',
    categoria: 'encanador',
    temChat: true,
  },
  {
    id: 6,
    nome: 'Ana Oliveira',
    avatar: anaAvatar,
    tipoBadge: 'verificado',
    badgeTexto: 'Verificada',
    profissao: 'Reformas & Pequenos Reparos em Geral',
    avaliacao: 4.9,
    numAvaliacoes: 67,
    distanciaTexto: 'a 4.0 km de você • Orçamento rápido sem compromisso',
    tags: ['Drywall', 'Alvenaria leve', 'Fixação de suportes e móveis'],
    precoLabel: 'A partir de',
    precoTexto: 'R$ 95/hora',
    categoria: 'reformas',
    temChat: false,
  },
]

export default function Busca() {
  const navigate = useNavigate()
  const { abrirChat } = useChat()
  const [params, setParams] = useSearchParams()
  const initialTermo = params.get('q') || params.get('categoria') || 'Eletricista residencial'
  const [termo, setTermo] = useState(initialTermo)
  const [filtroAtivo, setFiltroAtivo] = useState<'proximos' | 'avaliados' | 'online' | 'todos'>('proximos')

  const handleLimpar = () => {
    setTermo('')
    setParams({})
  }

  const profissionaisFiltrados = PROFISSIONAIS_BUSCA.filter((p) => {
    if (!termo.trim()) return true
    const t = termo.toLowerCase()
    return (
      p.nome.toLowerCase().includes(t) ||
      p.profissao.toLowerCase().includes(t) ||
      p.categoria.toLowerCase().includes(t) ||
      p.tags.some((tag) => tag.toLowerCase().includes(t))
    )
  })

  return (
    <div className="busca-viewport">
      <div className="busca-container">
        {/* Header Superior com Busca e Filtros */}
        <header className="busca-header">
          <div className="busca-header-inner">
            <div className="busca-nav-row">
              <Link to="/" className="back-btn" title="Voltar ao Início" aria-label="Voltar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>

              <div className="busca-input-wrapper">
                <span className="busca-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="busca-input"
                  placeholder="Buscar profissionais ou serviços..."
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                />
                {termo && (
                  <button className="busca-clear-btn" onClick={handleLimpar} title="Limpar busca">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              <button className="filter-toggle-btn" title="Abrir opções de filtro">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </button>

              <HeaderChatButton />
            </div>

            {/* Linha de Metadados: Contagem + Link para Mapa */}
            <div className="busca-meta-row">
              <div className="busca-count-info">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>
                  <strong>{profissionaisFiltrados.length} profissionais</strong> encontrados em São Paulo, SP
                </span>
              </div>

              <button className="mapa-link-btn" title="Ver profissionais no mapa">
                <span>Mapa</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
              </button>
            </div>

            {/* Chips de Filtro Rápido */}
            <div className="chips-scroll">
              <button
                className={`filter-chip ${filtroAtivo === 'proximos' ? 'active' : ''}`}
                onClick={() => setFiltroAtivo('proximos')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Mais Próximos</span>
              </button>

              <button
                className={`filter-chip ${filtroAtivo === 'avaliados' ? 'active' : ''}`}
                onClick={() => setFiltroAtivo('avaliados')}
              >
                <span style={{ color: filtroAtivo === 'avaliados' ? '#ffffff' : '#f59e0b' }}>★</span>
                <span>Melhor Avaliados</span>
              </button>

              <button
                className={`filter-chip ${filtroAtivo === 'online' ? 'active' : ''}`}
                onClick={() => setFiltroAtivo('online')}
              >
                <span className="chip-online-dot" />
                <span>Online Agora</span>
              </button>

              <button
                className={`filter-chip ${filtroAtivo === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroAtivo('todos')}
              >
                <span>Todos</span>
              </button>
            </div>
          </div>
        </header>

        {/* Lista de Profissionais Encontrados */}
        <main className="busca-main">
          <div className="busca-cards-list">
            {profissionaisFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <h3>Nenhum profissional encontrado</h3>
                <p>Tente buscar por outro termo ou categoria.</p>
                <button
                  className="btn-ver-perfil"
                  style={{ marginTop: '12px' }}
                  onClick={handleLimpar}
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              profissionaisFiltrados.map((prof) => (
                <article key={prof.id} className="search-prof-card">
                  {/* Badge de Destaque na Região se aplicável */}
                  {prof.destaqueRegiao && (
                    <div className="card-featured-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>Destaque na Região</span>
                    </div>
                  )}

                  {/* Topo com Avatar e Informações */}
                  <div className="search-prof-header">
                    <div className="search-avatar-wrapper">
                      <img src={prof.avatar} alt={prof.nome} className="search-avatar-img" />
                      <span className={`search-check-badge ${prof.tipoBadge === 'super' ? 'super' : ''}`}>
                        {prof.tipoBadge === 'super' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    </div>

                    <div className="search-info-block">
                      <div className="search-prof-name-row">
                        <h3 className="search-prof-name">{prof.nome}</h3>
                        <span className={prof.tipoBadge === 'super' ? 'search-pill-super' : 'search-pill-verificado'}>
                          {prof.tipoBadge === 'super' && <span>★</span>}
                          {prof.badgeTexto}
                        </span>
                      </div>

                      <p className="search-prof-sub">{prof.profissao}</p>

                      <div className="search-rating-line">
                        <span className="search-star">★</span>
                        <span className="search-rating-score">{prof.avaliacao.toFixed(1)}</span>
                        <span className="search-rating-reviews">• {prof.numAvaliacoes} avaliações</span>
                      </div>
                    </div>
                  </div>

                  {/* Faixa de Raio e Localização */}
                  <div className="location-radius-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{prof.distanciaTexto}</span>
                  </div>

                  {/* Tags e Serviços Oferecidos */}
                  <div className="specialties-tags">
                    {prof.tags.map((tag, idx) => (
                      <span key={idx} className="specialty-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rodapé com Preço e Botões */}
                  <div className="search-card-bottom">
                    <div className="search-price-block">
                      <span className="search-price-label">{prof.precoLabel}</span>
                      <span className="search-price-val">{prof.precoTexto}</span>
                    </div>

                    <div className="search-card-actions">
                      <button
                        className="btn-ver-perfil"
                        onClick={() => navigate(`/prestador/${prof.id}`)}
                        title={`Ver perfil completo de ${prof.nome}`}
                      >
                        <span>Ver Perfil</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {prof.temChat && (
                        <button className="btn-conversar" onClick={() => abrirChat(prof.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>Conversar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Banner Garantia Conecta Protege */}
          <section className="conecta-protege-card">
            <div className="protege-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>

            <div className="protege-text-block">
              <h4 className="protege-title">Garantia Conecta Protege</h4>
              <p className="protege-desc">
                Seu pagamento só é liberado após a confirmação do serviço concluído.
              </p>
            </div>
          </section>
        </main>

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="home-bottom-nav">
          <Link to="/" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Início</span>
          </Link>

          <Link to="/busca" className="nav-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Buscar</span>
          </Link>

          <Link to="/pedidos" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Pedidos</span>
          </Link>

          <AccountTrigger className="nav-item" title="Minha conta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil</span>
          </AccountTrigger>
        </nav>
      </div>
    </div>
  )
}
