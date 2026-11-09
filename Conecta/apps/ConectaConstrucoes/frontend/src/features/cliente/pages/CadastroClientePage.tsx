import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../../context/SessionContext'
import { buscarEnderecoPorCep } from '../services/viaCepService'
import { cadastrarCliente, type CadastroClienteForm } from '../services/clienteService'
import { ApiError } from '../../../core/api/http'
import './Cadastro.css'

export default function CadastroClientePage() {
  const navigate = useNavigate()
  const { entrar } = useSession()

  const [passo, setPasso] = useState<1 | 2>(1)
  const [carregando, setCarregando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  // Formulário
  const [form, setForm] = useState<CadastroClienteForm>({
    nomeCompleto: '',
    email: '',
    celular: '',
    senha: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
  })

  const [confirmarSenha, setConfirmarSenha] = useState('')

  const atualizarCampo = (campo: keyof CadastroClienteForm, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErro('')
  }

  // Mascaramento simples
  const formatarCep = (v: string) => {
    const limpo = v.replace(/\D/g, '').slice(0, 8)
    if (limpo.length > 5) return `${limpo.slice(0, 5)}-${limpo.slice(5)}`
    return limpo
  }

  const formatarTelefone = (v: string) => {
    const limpo = v.replace(/\D/g, '').slice(0, 11)
    if (limpo.length > 6) return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
    if (limpo.length > 2) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`
    return limpo
  }

  const handleBuscarCep = async (cepDigitado: string) => {
    const limpo = cepDigitado.replace(/\D/g, '')
    if (limpo.length !== 8) return

    try {
      setBuscandoCep(true)
      const endereco = await buscarEnderecoPorCep(limpo)
      if (endereco) {
        setForm((prev) => ({
          ...prev,
          rua: endereco.rua || prev.rua,
          bairro: endereco.bairro || prev.bairro,
          cidade: endereco.cidade || prev.cidade,
          estado: endereco.estado || prev.estado,
        }))
      }
    } finally {
      setBuscandoCep(false)
    }
  }

  const validarPasso1 = (e: FormEvent) => {
    e.preventDefault()
    if (!form.nomeCompleto.trim()) return setErro('Informe o nome completo.')
    if (!form.email.trim() || !form.email.includes('@')) return setErro('Informe um e-mail válido.')
    if (!form.celular.trim() || form.celular.replace(/\D/g, '').length < 10) return setErro('Informe um telefone/celular válido.')
    if (form.senha.length < 6) return setErro('A senha deve ter no mínimo 6 caracteres.')
    if (form.senha !== confirmarSenha) return setErro('As senhas não coincidem.')

    setErro('')
    setPasso(2)
  }

  const handleSubmitFinal = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.cep.trim()) return setErro('Informe o CEP.')
    if (!form.rua.trim()) return setErro('Informe a rua/logradouro.')
    if (!form.cidade.trim()) return setErro('Informe a cidade.')
    if (!form.estado.trim()) return setErro('Informe o estado (UF).')

    try {
      setCarregando(true)
      setErro('')

      const res = await cadastrarCliente(form)

      if (res.token) {
        localStorage.setItem('conecta.token', res.token)
        entrar(
          {
            id: String(res.id),
            nome: res.nome,
            email: res.email,
            perfis: ['CLIENTE'],
          },
          'CLIENTE',
        )
      }

      setSucesso(true)
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        try {
          const parsed = JSON.parse(err.message)
          setErro(parsed.mensagem || 'Não foi possível concluir o cadastro.')
        } catch {
          setErro(err.message || 'Erro ao realizar o cadastro.')
        }
      } else {
        setErro('Falha na comunicação com o servidor.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="cadastro-viewport">
      <main className="cadastro-card">
        <div className="cadastro-brand">
          <span className="cadastro-logo">C</span>
          <h1>Criar Conta no Conecta</h1>
          <p>Conecte-se aos melhores prestadores da região</p>
        </div>

        <div className="cadastro-steps">
          <div className={`cadastro-step-item ${passo >= 1 ? 'active' : ''}`}>
            <span className="cadastro-step-num">1</span>
            <span>Identificação</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>—</span>
          <div className={`cadastro-step-item ${passo >= 2 ? 'active' : ''}`}>
            <span className="cadastro-step-num">2</span>
            <span>Endereço</span>
          </div>
        </div>

        {erro && <div className="cadastro-error" role="alert" style={{ marginBottom: '14px' }}>{erro}</div>}

        {sucesso ? (
          <div className="cadastro-success">
            <h3>Cadastro realizado com sucesso!</h3>
            <p>Redirecionando para a página inicial...</p>
          </div>
        ) : passo === 1 ? (
          <form className="cadastro-form" onSubmit={validarPasso1} noValidate>
            <label className="cadastro-field">
              <span>Nome Completo *</span>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={form.nomeCompleto}
                onChange={(e) => atualizarCampo('nomeCompleto', e.target.value)}
                required
              />
            </label>

            <label className="cadastro-field">
              <span>E-mail *</span>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={form.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
                required
              />
            </label>

            <label className="cadastro-field">
              <span>Celular / WhatsApp *</span>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.celular}
                onChange={(e) => atualizarCampo('celular', formatarTelefone(e.target.value))}
                required
              />
            </label>

            <div className="cadastro-grid-2">
              <label className="cadastro-field">
                <span>Senha *</span>
                <input
                  type="password"
                  placeholder="Mínimo 6 dígitos"
                  value={form.senha}
                  onChange={(e) => atualizarCampo('senha', e.target.value)}
                  required
                />
              </label>

              <label className="cadastro-field">
                <span>Confirmar Senha *</span>
                <input
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value)
                    setErro('')
                  }}
                  required
                />
              </label>
            </div>

            <div className="cadastro-actions">
              <button type="submit" className="cadastro-btn">
                Próximo: Endereço &rarr;
              </button>
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
              Já tem cadastro?{' '}
              <Link to="/login" style={{ color: '#0a4fb0', fontWeight: 600, textDecoration: 'none' }}>
                Entrar
              </Link>
            </div>
          </form>
        ) : (
          <form className="cadastro-form" onSubmit={handleSubmitFinal} noValidate>
            <div className="cadastro-grid-2">
              <label className="cadastro-field">
                <span>CEP * {buscandoCep && <small>(Buscando...)</small>}</span>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => {
                    const formatado = formatarCep(e.target.value)
                    atualizarCampo('cep', formatado)
                    if (formatado.replace(/\D/g, '').length === 8) {
                      handleBuscarCep(formatado)
                    }
                  }}
                  onBlur={() => handleBuscarCep(form.cep)}
                  required
                />
              </label>

              <label className="cadastro-field">
                <span>Número *</span>
                <input
                  type="text"
                  placeholder="Ex: 120"
                  value={form.numero}
                  onChange={(e) => atualizarCampo('numero', e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="cadastro-field">
              <span>Rua / Logradouro *</span>
              <input
                type="text"
                placeholder="Nome da rua ou avenida"
                value={form.rua}
                onChange={(e) => atualizarCampo('rua', e.target.value)}
                required
              />
            </label>

            <div className="cadastro-grid-2">
              <label className="cadastro-field">
                <span>Complemento</span>
                <input
                  type="text"
                  placeholder="Apto, Bloco, etc."
                  value={form.complemento || ''}
                  onChange={(e) => atualizarCampo('complemento', e.target.value)}
                />
              </label>

              <label className="cadastro-field">
                <span>Bairro</span>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={form.bairro}
                  onChange={(e) => atualizarCampo('bairro', e.target.value)}
                />
              </label>
            </div>

            {/* Fallback de segurança: campos de Cidade e Estado são editáveis para o usuário digitar caso o ViaCEP falhe */}
            <div className="cadastro-grid-2">
              <label className="cadastro-field">
                <span>Cidade *</span>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={form.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                  required
                />
              </label>

              <label className="cadastro-field">
                <span>Estado (UF) *</span>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={form.estado}
                  onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase())}
                  required
                />
              </label>
            </div>

            <div className="cadastro-actions">
              <button
                type="button"
                className="cadastro-btn cadastro-btn-secondary"
                onClick={() => {
                  setErro('')
                  setPasso(1)
                }}
                disabled={carregando}
              >
                &larr; Voltar
              </button>
              <button type="submit" className="cadastro-btn" disabled={carregando}>
                {carregando ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
