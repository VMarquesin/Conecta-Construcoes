import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import './ProAnaliseSolicitacao.css'

import lucasAvatar from '../../assets/avatars/lucas.jpg'
import quadroDisjuntores from '../../assets/portfolio/quadro.jpg'
import carlosAvatar from '../../assets/avatars/carlos.jpg'

export default function ProAnaliseSolicitacao() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const pedidoId = id || '1042'
  const { abrirChat } = useChat()

  // Timer decrescente de resposta (15 min)
  const [segundosRestantes, setSegundosRestantes] = useState(466) // 7:46
  const [valorProposta, setValorProposta] = useState<number>(180)
  const [horarioSelecionado, setHorarioSelecionado] = useState('Hoje às 16:00')
  const [observacoes, setObservacoes] = useState('Inclui revisão completa do circuito do chuveiro.')
  const [modalFotoZoom, setModalFotoZoom] = useState(false)
  const [enviadoSucesso, setEnviadoSucesso] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatarTempo = (totalSegundos: number) => {
    const min = Math.floor(totalSegundos / 60)
    const seg = totalSegundos % 60
    return `${min}:${seg < 10 ? '0' : ''}${seg}`
  }

  // Cálculo da taxa Conecta Protege (8% de comissão/seguro)
  const valorLiquido = (valorProposta * 0.92).toFixed(2).replace('.', ',')

  const handleEnviarProposta = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviadoSucesso(true)
    setTimeout(() => {
      // Abre o chat flutuante com a proposta ou navega para o painel
      abrirChat('carlos-silva')
      navigate('/pro')
    }, 1200)
  }

  const handleRecusar = () => {
    if (confirm('Deseja realmente recusar esta solicitação de serviço?')) {
      navigate('/pro')
    }
  }

  return (
    <div className="analise-viewport">
      <div className="analise-container">
        {/* Top Header */}
        <header className="analise-header">
          <button className="analise-back-btn" onClick={() => navigate('/pro')} title="Voltar ao Painel">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <h1 className="analise-header-title">Detalhes Da Solicitação</h1>

          <div className="analise-user-avatar-wrap" title="Carlos Silva">
            <img src={carlosAvatar} alt="Carlos Silva" className="analise-header-avatar" />
          </div>
        </header>

        {enviadoSucesso && (
          <div className="proposta-sucesso-toast">
            ✓ Proposta de R$ {valorProposta},00 enviada ao cliente com sucesso!
          </div>
        )}

        {/* Sub-header com Tag do Pedido e Ampulheta */}
        <div className="analise-subhead-row">
          <div className="analise-tag-chamado">
            <span className="dot-blue-indicator" />
            <span>#{pedidoId} • Novo Chamado</span>
          </div>

          <div className="analise-timer-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Expira em {formatarTempo(segundosRestantes)}</span>
          </div>
        </div>

        {/* Banner de Urgência no Ranking */}
        <div className="analise-ranking-alert-box">
          <div className="ranking-alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="ranking-alert-text">
            <div className="ranking-alert-title-row">
              <strong>Aguardando sua resposta</strong>
              <span className="timer-highlight-chip">{formatarTempo(segundosRestantes)}</span>
            </div>
            <p>Responda em até 15 min para prioridade no ranking Conecta Pro.</p>
          </div>
        </div>

        <div className="analise-grid-layout">
          {/* Coluna 1: Dados do Cliente e Resumo do Serviço */}
          <div className="analise-col-left">
            {/* Card do Cliente */}
            <div className="analise-card cliente-card">
              <div className="cliente-info-row">
                <div className="cliente-avatar-wrap">
                  <img src={lucasAvatar} alt="Matheus Oliveira" className="cliente-avatar-img" />
                  <span className="cliente-check-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>

                <div className="cliente-meta-col">
                  <div className="cliente-name-row">
                    <h3 className="cliente-name">Matheus Oliveira</h3>
                    <span className="cliente-rating">★ 4.9</span>
                  </div>
                  <div className="cliente-dist-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#0056D6">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span>a 1.8 km de você</span>
                    <span className="bullet-sep">•</span>
                    <span className="cliente-bairro">Centro, Tupã</span>
                  </div>
                  <p className="cliente-address-sub">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Rua Nhambiquaras, próx. Praça da Bandeira
                  </p>
                </div>
              </div>

              {/* Box de Rota Estimada */}
              <div className="cliente-trajeto-box">
                <div className="trajeto-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div className="trajeto-info">
                  <span className="trajeto-title">Estimativa de trajeto</span>
                  <span className="trajeto-sub">Aprox. 6 min de moto / carro</span>
                </div>
                <button
                  className="btn-ver-rota-link"
                  onClick={() => window.open('https://maps.google.com/?q=Rua+Nhambiquaras+Tupa', '_blank')}
                >
                  Ver rota &gt;
                </button>
              </div>
            </div>

            {/* Card Detalhes do Serviço Solicitado */}
            <div className="analise-card servico-card">
              <div className="servico-tags-row">
                <span className="tag-pill tag-eletrica">Elétrica Residencial</span>
                <span className="tag-pill tag-urgente">! Urgente</span>
                <span className="tag-timestamp">Hoje, 14:12</span>
              </div>

              <div className="servico-quote-bubble">
                <p>
                  “Troca de fiação do chuveiro e disjuntores no quadro de energia. O disjuntor bipolar de 30A está desarmando frequentemente quando ligamos o chuveiro. Preciso de avaliação do cabeamento e troca necessária.”
                </p>
              </div>

              {/* Foto Anexada */}
              <div className="anexos-cliente-section">
                <div className="anexos-header">
                  <div className="anexos-title-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Fotos Anexadas pelo Cliente</span>
                  </div>
                  <span className="anexos-count">1 foto</span>
                </div>

                <div className="anexo-foto-card" onClick={() => setModalFotoZoom(true)}>
                  <img src={quadroDisjuntores} alt="Quadro elétrico principal" className="anexo-foto-img" />
                  <div className="anexo-foto-footer">
                    <div className="anexo-foto-caption">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span>Quadro elétrico principal</span>
                    </div>
                    <button className="anexo-zoom-btn" title="Ampliar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Formulário de Envio da Proposta */}
          <div className="analise-col-right">
            <form className="analise-card proposta-form-card" onSubmit={handleEnviarProposta}>
              <div className="proposta-form-header">
                <span className="dot-proposta-blue" />
                <div>
                  <h2 className="proposta-form-title">Sua Proposta de Orçamento</h2>
                  <p className="proposta-form-desc">
                    Defina o valor da mão de obra inicial ou orçamento total. O cliente poderá aprovar e pagar com segurança pelo Conecta Protege.
                  </p>
                </div>
              </div>

              {/* 1. Valor da Proposta */}
              <div className="form-group">
                <label className="form-label">Valor da Proposta / Mão de Obra</label>
                <div className="valor-hero-input-wrap">
                  <span className="valor-currency">R$</span>
                  <input
                    type="number"
                    className="valor-number-input"
                    value={valorProposta}
                    onChange={(e) => setValorProposta(Number(e.target.value))}
                    min={10}
                    step={5}
                  />
                </div>

                {/* Chips de Valores Rápidos */}
                <div className="valor-quick-chips">
                  {[120, 150, 180, 220].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`chip-valor-btn ${valorProposta === v ? 'active' : ''}`}
                      onClick={() => setValorProposta(v)}
                    >
                      R$ {v} {v === 180 ? '(Sugerido)' : ''}
                    </button>
                  ))}
                </div>

                {/* Box de Repasse Líquido */}
                <div className="repasse-liquido-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>
                    Você receberá líquido: <strong>R$ {valorLiquido}</strong> (Garantia Conecta Protege inclusa)
                  </span>
                </div>
              </div>

              {/* 2. Previsão de Atendimento */}
              <div className="form-group">
                <label className="form-label">Previsão de Atendimento / Visita</label>
                <div className="previsao-display-field">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{horarioSelecionado}</span>
                </div>

                <div className="horarios-quick-chips">
                  {['Hoje às 16:00', 'Hoje às 17:30', 'Amanhã de manhã'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`chip-horario-btn ${horarioSelecionado === h ? 'active' : ''}`}
                      onClick={() => setHorarioSelecionado(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Observações Adicionais */}
              <div className="form-group">
                <div className="obs-label-row">
                  <label className="form-label">Observações Adicionais (Opcional)</label>
                  <span className="obs-hint">Rápida e clara</span>
                </div>
                <textarea
                  className="obs-textarea"
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Inclui ferramentas e teste com multímetro..."
                />
              </div>

              {/* Selo Seguro */}
              <div className="seguro-garantia-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Proposta coberta pelo seguro Conecta Protege até R$ 5.000</span>
              </div>

              {/* Botões de Ação */}
              <div className="form-actions-stack">
                <button type="submit" className="btn-enviar-proposta-cliente">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <span>Enviar Proposta ao Cliente</span>
                </button>

                <button type="button" className="btn-recusar-link" onClick={handleRecusar}>
                  Recusar serviço
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Zoom da Foto */}
        {modalFotoZoom && (
          <div className="analise-modal-overlay" onClick={() => setModalFotoZoom(false)}>
            <div className="analise-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span>Quadro elétrico principal (Foto do cliente)</span>
                <button onClick={() => setModalFotoZoom(false)}>✕</button>
              </div>
              <img src={quadroDisjuntores} alt="Zoom" className="modal-full-img" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
