import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './PedidoDetalhe.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import quadroDisjuntores from '../assets/portfolio/quadro.jpg'

export default function PedidoDetalhe() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const pedidoNumero = id || '1042'

  const [modalFotoAberta, setModalFotoAberta] = useState(false)
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false)
  const [pagamentoConcluido, setPagamentoConcluido] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix')
  const [pedidoCancelado, setPedidoCancelado] = useState(false)

  const handleCancelar = () => {
    if (confirm('Tem certeza que deseja cancelar o pedido #' + pedidoNumero + '? O cancelamento é gratuito.')) {
      setPedidoCancelado(true)
      setTimeout(() => {
        navigate('/pedidos')
      }, 1200)
    }
  }

  const handleConcluirPagamento = () => {
    setPagamentoConcluido(true)
    setTimeout(() => {
      setModalPagamentoAberto(false)
      setPagamentoConcluido(false)
      alert('Pagamento realizado com sucesso! O valor foi retido com segurança na Garantia Conecta Protege.')
    }, 1500)
  }

  return (
    <div className="detalhe-viewport">
      <div className="detalhe-container">
        {/* Top Header Global Responsivo */}
        <header className="detalhe-top-header">
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

            {/* Navegação Desktop */}
            <nav className="desktop-nav">
              <Link to="/" className="desktop-nav-link">Início</Link>
              <Link to="/busca" className="desktop-nav-link">Buscar Serviços</Link>
              <Link to="/pedidos" className="desktop-nav-link active">Meus Pedidos</Link>
              <Link to="/admin" className="desktop-nav-link">Painel Admin</Link>
            </nav>

            {/* Ações da Direita */}
            <div className="home-header-actions">
              <button className="header-action-btn" title="Notificações" aria-label="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="header-badge-dot" />
              </button>

              <Link to="/admin" className="user-avatar-btn" title="Meu Perfil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Barra de Título do Pedido */}
        <div className="detalhe-title-bar">
          <div className="title-left">
            <button className="back-icon-btn" onClick={() => navigate('/pedidos')} title="Voltar para Meus Pedidos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className="pedido-heading-info">
              <div className="pedido-heading-row">
                <h1 className="pedido-title">Pedido #{pedidoNumero}</h1>
                <span className="pedido-status-badge badge-aceito">Aceito</span>
              </div>
              <span className="pedido-timestamp">Criado hoje às 14:30</span>
            </div>
          </div>

          <div className="title-actions">
            <button className="round-action-btn" title="Ajuda sobre o pedido">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            <button className="round-action-btn" title="Mais opções">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mensagem de confirmação de cancelamento temporária */}
        {pedidoCancelado && (
          <div className="pedido-cancelado-toast">
            Pedido cancelado com sucesso. Redirecionando para Meus Pedidos...
          </div>
        )}

        {/* Grid de Conteúdo: Layout 2 Colunas no Desktop, 1 Coluna no Mobile */}
        <div className="detalhe-main-grid">
          {/* Coluna Esquerda: Status + Resumo do Serviço */}
          <div className="detalhe-col-principal">
            {/* 1. Card Status do Atendimento */}
            <div className="detalhe-card status-card">
              <div className="status-header-row">
                <span className="status-label">STATUS DO ATENDIMENTO</span>
                <span className="status-pill-andamento">
                  <span className="pill-dot" />
                  Em andamento
                </span>
              </div>

              {/* Linha do Tempo / Stepper */}
              <div className="stepper-container">
                <div className="stepper-line">
                  <div className="stepper-progress" style={{ width: '50%' }} />
                </div>

                <div className="stepper-steps">
                  {/* Passo 1: Solicitado */}
                  <div className="step-item step-completed">
                    <div className="step-circle">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="step-title">Solicitado</span>
                    <span className="step-sub">14:30</span>
                  </div>

                  {/* Passo 2: Aceito (Ativo) */}
                  <div className="step-item step-active">
                    <div className="step-circle circle-thumbs">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    </div>
                    <span className="step-title step-title-active">Aceito</span>
                    <span className="step-badge-confirmando">Confirmando</span>
                  </div>

                  {/* Passo 3: Concluído */}
                  <div className="step-item step-pending">
                    <div className="step-circle circle-pending">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    </div>
                    <span className="step-title step-title-muted">Concluído</span>
                    <span className="step-sub">Final</span>
                  </div>
                </div>
              </div>

              {/* Box Informativo Conecta Protege */}
              <div className="status-info-box">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <p className="info-text">
                  Carlos aceitou seu chamado! Combine o horário exato pelo chat integrado para que o deslocamento seja iniciado com segurança.
                </p>
              </div>
            </div>

            {/* 2. Card Resumo do Serviço */}
            <div className="detalhe-card resumo-card">
              <div className="resumo-header-row">
                <h2 className="card-section-title">Resumo do Serviço</h2>
                <span className="tag-categoria">Elétrica</span>
              </div>

              <h3 className="servico-nome">Troca de fiação do chuveiro e disjuntores</h3>

              {/* Descrição do Cliente em Balão */}
              <div className="cliente-descricao-box">
                <p>
                  “Disjuntor bipolar de 30A desarmando constantemente quando o chuveiro é ligado. Necessário avaliar o cabeamento de 6mm e trocar disjuntor para dimensionamento seguro com a fiação do quadro.”
                </p>
              </div>

              {/* Foto do local anexada */}
              <div className="foto-anexada-section">
                <div className="foto-section-header">
                  <span className="foto-section-title">Foto do local anexada</span>
                  <span className="foto-section-count">1 anexo</span>
                </div>

                <div className="foto-thumbnail-wrapper" onClick={() => setModalFotoAberta(true)} title="Clique para ampliar a foto do quadro">
                  <img src={quadroDisjuntores} alt="Quadro de disjuntores" className="foto-thumbnail-img" />
                  <div className="foto-overlay-tag">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Quadro_de_disjuntores.jpg</span>
                  </div>
                </div>
              </div>

              {/* Metadados de Atendimento */}
              <div className="meta-info-list">
                <div className="meta-item">
                  <div className="meta-icon-wrapper meta-icon-blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="meta-text-col">
                    <span className="meta-label">Local do Atendimento</span>
                    <span className="meta-val">Casa (Padrão) - Av. Paulista, 1578 – Apto 82, Bela Vista, São Paulo - SP</span>
                  </div>
                </div>

                <div className="meta-item">
                  <div className="meta-icon-wrapper meta-icon-blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="meta-text-col">
                    <span className="meta-label">Data e Previsão</span>
                    <span className="meta-val">
                      Hoje, a partir das 16:00 <strong className="meta-highlight">(A combinar no chat)</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card do Prestador + Valores & Condições + Ações */}
          <div className="detalhe-col-lateral">
            {/* Card do Prestador */}
            <div className="detalhe-card prestador-card">
              <div className="prestador-info-row">
                <div className="prestador-avatar-container">
                  <img src={carlosAvatar} alt="Carlos Silva" className="prestador-avatar-img" />
                  <span className="online-status-dot" title="Online agora" />
                  <div className="prestador-verificado-badge" title="Prestador verificado">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div className="prestador-text-col">
                  <div className="prestador-nome-row">
                    <h3 className="prestador-nome">Carlos Silva</h3>
                    <span className="check-azul-icon" title="Verificado Conecta">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0056D6">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <span className="prestador-profissao">Eletricista Residencial & Predial</span>
                  <div className="prestador-rating-row">
                    <span className="star-icon">★</span>
                    <strong className="rating-score">4.9</strong>
                    <span className="rating-count">(128 avaliações)</span>
                    <span className="rating-dot">•</span>
                    <span className="rating-dist">a 2.5 km</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Prestador */}
              <div className="prestador-buttons-row">
                <Link to={`/chat/${pedidoNumero}`} className="btn-chat-principal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Abrir Conversa no Chat</span>
                  <span className="chat-badge-dot" />
                </Link>

                <button
                  className="btn-call-circle"
                  title="Ligar para Carlos Silva"
                  onClick={() => alert('Ligação para o número de suporte protegido de Carlos Silva iniciada: (11) 98765-4321')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card Valores e Condições */}
            <div className="detalhe-card valores-card">
              <div className="valores-header-row">
                <h2 className="card-section-title">Valores e Condições</h2>
                <span className="orcamento-tipo-tag">Orçamento fixo</span>
              </div>

              {/* Lista de itens discriminados */}
              <div className="itens-discriminados-list">
                <div className="item-discriminado-row">
                  <span className="item-desc">Mão de obra técnica especializada</span>
                  <strong className="item-valor">R$ 130,00</strong>
                </div>

                <div className="item-discriminado-row">
                  <span className="item-desc">Substituição de Disjuntor Bipolar 40A</span>
                  <strong className="item-valor">R$ 50,00</strong>
                </div>

                <div className="item-discriminado-row row-garantia">
                  <div className="garantia-tag-wrap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>Garantia de 90 dias Conecta</span>
                  </div>
                  <span className="inclusa-badge">Inclusa</span>
                </div>
              </div>

              {/* Total Acordado */}
              <div className="valor-total-row">
                <div className="total-col">
                  <span className="total-label">Valor Acordado</span>
                  <span className="total-valor">R$ 180,00</span>
                </div>
                <div className="parcelas-tag">ou até 3x de R$ 60,00</div>
              </div>

              {/* Selo Conecta Protege */}
              <div className="garantia-conecta-box">
                <div className="garantia-shield-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <rect x="9" y="11" width="6" height="5" rx="1" stroke="#059669" strokeWidth="2" />
                    <path d="M10 11V9a2 2 0 1 1 4 0v2" stroke="#059669" strokeWidth="2" />
                  </svg>
                </div>
                <div className="garantia-text-col">
                  <strong className="garantia-titulo">Garantia Conecta Protege</strong>
                  <p className="garantia-desc">
                    Pagamento retido com total segurança até a conclusão e validação do serviço.
                  </p>
                </div>
              </div>

              {/* Botões de Ação Final */}
              <div className="valores-action-buttons">
                <button
                  className="btn-confirmar-pagar"
                  onClick={() => setModalPagamentoAberto(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span>Confirmar e Pagar Orçamento</span>
                </button>

                <button className="btn-cancelar-pedido" onClick={handleCancelar}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>Cancelar Pedido</span>
                </button>

                <p className="cancelamento-legenda">
                  Cancelamento gratuito até 1 hora antes do início do deslocamento do profissional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Zoom da Foto Anexada */}
        {modalFotoAberta && (
          <div className="modal-overlay" onClick={() => setModalFotoAberta(false)}>
            <div className="modal-foto-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-foto-header">
                <span>Quadro_de_disjuntores.jpg (Foto do local anexada)</span>
                <button className="modal-close-btn" onClick={() => setModalFotoAberta(false)}>✕</button>
              </div>
              <img src={quadroDisjuntores} alt="Quadro de disjuntores ampliado" className="modal-foto-full" />
            </div>
          </div>
        )}

        {/* Modal de Pagamento Seguro Conecta Protege */}
        {modalPagamentoAberto && (
          <div className="modal-overlay" onClick={() => setModalPagamentoAberto(false)}>
            <div className="modal-pagamento-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-pagamento-header">
                <div>
                  <h3 className="modal-pagamento-title">Pagamento Seguro Conecta</h3>
                  <span className="modal-pagamento-sub">Pedido #{pedidoNumero} • R$ 180,00</span>
                </div>
                <button className="modal-close-btn" onClick={() => setModalPagamentoAberto(false)}>✕</button>
              </div>

              {pagamentoConcluido ? (
                <div className="pagamento-sucesso-view">
                  <div className="sucesso-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4>Pagamento Confirmado!</h4>
                  <p>O valor foi retido com segurança. O Carlos Silva foi notificado para iniciar o atendimento.</p>
                </div>
              ) : (
                <div className="modal-pagamento-body">
                  <div className="metodos-tabs">
                    <button
                      className={`metodo-btn ${metodoPagamento === 'pix' ? 'active' : ''}`}
                      onClick={() => setMetodoPagamento('pix')}
                    >
                      PIX (Aprovação Instantânea)
                    </button>
                    <button
                      className={`metodo-btn ${metodoPagamento === 'cartao' ? 'active' : ''}`}
                      onClick={() => setMetodoPagamento('cartao')}
                    >
                      Cartão de Crédito (até 3x)
                    </button>
                  </div>

                  {metodoPagamento === 'pix' ? (
                    <div className="pix-content">
                      <div className="pix-qr-box">
                        <div className="qr-fake">
                          <svg width="120" height="120" viewBox="0 0 24 24" fill="#0f172a">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm4-4v-4h-4v4h4zm-4-4h4v4h-4v-4zm-2 2h-2v2h2v-2zm0-4h-2v2h2v-2zm-2 2h-2v2h2v-2z" />
                          </svg>
                        </div>
                        <span className="pix-code-text">00020126580014br.gov.bcb.pix0136conecta-protege-1042</span>
                      </div>
                      <p className="pix-hint">Abra o app do seu banco e escaneie o QR Code ou pague com a chave copia e cola.</p>
                    </div>
                  ) : (
                    <div className="cartao-content">
                      <input type="text" placeholder="Número do Cartão (0000 0000 0000 0000)" className="checkout-input" defaultValue="4532 •••• •••• 8912" />
                      <div className="cartao-row">
                        <input type="text" placeholder="MM/AA" className="checkout-input" defaultValue="08/29" />
                        <input type="text" placeholder="CVV" className="checkout-input" defaultValue="782" />
                      </div>
                      <select className="checkout-input">
                        <option>1x de R$ 180,00 sem juros</option>
                        <option>2x de R$ 90,00 sem juros</option>
                        <option>3x de R$ 60,00 sem juros</option>
                      </select>
                    </div>
                  )}

                  <div className="seguranca-retencao-aviso">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Seu dinheiro só é transferido ao prestador após você validar a conclusão.</span>
                  </div>

                  <button className="btn-confirmar-checkout" onClick={handleConcluirPagamento}>
                    Efetuar Pagamento de R$ 180,00
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="home-bottom-nav">
          <Link to="/" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Início</span>
          </Link>

          <Link to="/busca" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Buscar</span>
          </Link>

          <Link to="/pedidos" className="nav-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Pedidos</span>
          </Link>

          <Link to="/admin" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
