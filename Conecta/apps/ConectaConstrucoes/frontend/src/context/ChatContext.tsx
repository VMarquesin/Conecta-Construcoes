import React, { createContext, useContext, useState, useEffect } from 'react'
import { chatService, type ConversaResponse } from '../features/cliente/services/chatService'

export interface MensagemItem {
  id: string
  remetente: 'usuario' | 'prestador'
  texto?: string
  imagemUrl?: string
  imagemLegenda?: string
  hora: string
  status?: string
  isProposta?: boolean
}

export interface Conversa {
  id: string
  conversaId?: number
  prestadorId: number
  nome: string
  profissao: string
  avatar: string
  online: boolean
  statusTexto: string
  naoLida: boolean
  ultimaMensagem: string
  tempo: string
  pedidoNumero?: string
  mensagens: MensagemItem[]
}

interface ChatContextType {
  conversas: Conversa[]
  loading: boolean
  dropdownAberto: boolean
  setDropdownAberto: (aberto: boolean | ((prev: boolean) => boolean)) => void
  toggleDropdown: () => void
  chatJanelaAtiva: Conversa | null
  isMinimizado: boolean
  abrirChat: (conversaIdOuPrestadorId: string | number) => void
  fecharJanela: () => void
  minimizarJanela: () => void
  restaurarJanela: () => void
  enviarMensagem: (conversaId: string, texto: string) => Promise<void>
  totalNaoLidas: number
  recarregarConversas: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(false)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [chatJanelaAtiva, setChatJanelaAtiva] = useState<Conversa | null>(null)
  const [isMinimizado, setIsMinimizado] = useState(false)

  const carregarConversas = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('conecta_token')
    if (!token) {
      setConversas([])
      return
    }

    try {
      setLoading(true)
      const data: ConversaResponse[] = await chatService.listarConversas()
      if (Array.isArray(data) && data.length > 0) {
        const mapeadas: Conversa[] = data.map((c) => ({
          id: String(c.conversaId || c.id),
          conversaId: c.conversaId,
          prestadorId: c.prestadorId,
          nome: c.nome || 'Profissional',
          profissao: c.profissao || 'Prestador de Serviços',
          avatar: c.avatar || '',
          online: c.online ?? false,
          statusTexto: c.statusTexto || 'Disponível',
          naoLida: c.naoLida ?? false,
          ultimaMensagem: c.ultimaMensagem || '',
          tempo: c.tempo || '',
          pedidoNumero: c.pedidoNumero,
          mensagens: (c.mensagens || []).map((m) => ({
            id: String(m.id),
            remetente: m.remetente,
            texto: m.texto,
            imagemUrl: m.imagemUrl,
            imagemLegenda: m.imagemLegenda,
            hora: m.hora,
            status: m.status,
            isProposta: m.isProposta,
          })),
        }))
        setConversas(mapeadas)
      } else {
        setConversas([])
      }
    } catch {
      setConversas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarConversas()
  }, [])

  const toggleDropdown = () => {
    setDropdownAberto((prev) => {
      const next = !prev
      if (next) carregarConversas()
      return next
    })
  }

  const abrirChat = (conversaIdOuPrestadorId: string | number) => {
    setDropdownAberto(false)

    // Busca conversa existente
    const encontrada = conversas.find(
      (c) =>
        c.id === String(conversaIdOuPrestadorId) ||
        c.prestadorId === Number(conversaIdOuPrestadorId) ||
        (c.conversaId && c.conversaId === Number(conversaIdOuPrestadorId))
    )

    if (encontrada) {
      setConversas((prev) =>
        prev.map((c) => (c.id === encontrada.id ? { ...c, naoLida: false } : c))
      )
      setChatJanelaAtiva({ ...encontrada, naoLida: false })
      setIsMinimizado(false)
    } else {
      // Se a conversa não existir no array, abre janela limpa com o ID informado (sem mockar contatos)
      const novoId = String(conversaIdOuPrestadorId)
      const novaConversa: Conversa = {
        id: novoId,
        prestadorId: Number(conversaIdOuPrestadorId) || 0,
        nome: 'Profissional',
        profissao: 'Prestador de Serviços',
        avatar: '',
        online: false,
        statusTexto: 'Disponível',
        naoLida: false,
        ultimaMensagem: '',
        tempo: 'Agora',
        mensagens: [],
      }
      setChatJanelaAtiva(novaConversa)
      setIsMinimizado(false)
    }
  }

  const fecharJanela = () => {
    setChatJanelaAtiva(null)
    setIsMinimizado(false)
  }

  const minimizarJanela = () => {
    setIsMinimizado(true)
  }

  const restaurarJanela = () => {
    setIsMinimizado(false)
  }

  const enviarMensagem = async (conversaId: string, texto: string) => {
    if (!texto.trim()) return

    const now = new Date()
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const novaMsg: MensagemItem = {
      id: Date.now().toString(),
      remetente: 'usuario',
      texto: texto.trim(),
      hora,
      status: 'Enviando...',
    }

    // Otimista
    setChatJanelaAtiva((prev) => {
      if (prev && prev.id === conversaId) {
        return {
          ...prev,
          mensagens: [...prev.mensagens, novaMsg],
          ultimaMensagem: texto.trim(),
          tempo: 'Agora',
        }
      }
      return prev
    })

    const idNumerico = Number(conversaId)
    if (!isNaN(idNumerico) && idNumerico > 0) {
      try {
        await chatService.enviarMensagem(idNumerico, { texto: texto.trim() })
        // Marca como entregue
        setChatJanelaAtiva((prev) => {
          if (prev && prev.id === conversaId) {
            return {
              ...prev,
              mensagens: prev.mensagens.map((m) =>
                m.id === novaMsg.id ? { ...m, status: 'Entregue' } : m
              ),
            }
          }
          return prev
        })
      } catch (err) {
        console.warn('Mensagem enviada localmente (offline ou pendente):', err)
      }
    }
  }

  const totalNaoLidas = conversas.filter((c) => c.naoLida).length

  return (
    <ChatContext.Provider
      value={{
        conversas,
        loading,
        dropdownAberto,
        setDropdownAberto,
        toggleDropdown,
        chatJanelaAtiva,
        isMinimizado,
        abrirChat,
        fecharJanela,
        minimizarJanela,
        restaurarJanela,
        enviarMensagem,
        totalNaoLidas,
        recarregarConversas: carregarConversas,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider')
  }
  return context
}
