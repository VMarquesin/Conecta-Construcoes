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
  marcarComoLido: (conversaIdOuPrestadorId?: string | number) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
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
      if (next) {
        carregarConversas()
        marcarTodasComoLidas()
      }
      return next
    })
  }

  const marcarComoLido = async (conversaIdOuPrestadorId?: string | number) => {
    if (!conversaIdOuPrestadorId) {
      await marcarTodasComoLidas()
      return
    }

    const idNum = Number(conversaIdOuPrestadorId)
    setConversas((prev) =>
      prev.map((c) =>
        c.id === String(conversaIdOuPrestadorId) ||
        c.prestadorId === idNum ||
        (c.conversaId && c.conversaId === idNum)
          ? { ...c, naoLida: false }
          : c
      )
    )

    const encontrada = conversas.find(
      (c) =>
        c.id === String(conversaIdOuPrestadorId) ||
        c.prestadorId === idNum ||
        (c.conversaId && c.conversaId === idNum)
    )
    const targetId = encontrada?.conversaId || (encontrada ? Number(encontrada.id) : idNum)
    if (!isNaN(targetId) && targetId > 0) {
      await chatService.marcarComoLida(targetId)
    }
  }

  const marcarTodasComoLidas = async () => {
    const unreadList = conversas.filter((c) => c.naoLida)
    setConversas((prev) => prev.map((c) => ({ ...c, naoLida: false })))
    for (const c of unreadList) {
      const idNum = c.conversaId || Number(c.id)
      if (!isNaN(idNum) && idNum > 0) {
        chatService.marcarComoLida(idNum)
      }
    }
  }

  const abrirChat = async (conversaIdOuPrestadorId: string | number) => {
    setDropdownAberto(false)

    const idNum = Number(conversaIdOuPrestadorId)

    // Busca conversa existente no estado local
    const encontrada = conversas.find(
      (c) =>
        c.id === String(conversaIdOuPrestadorId) ||
        c.prestadorId === idNum ||
        (c.conversaId && c.conversaId === idNum)
    )

    if (encontrada) {
      setConversas((prev) =>
        prev.map((c) => (c.id === encontrada.id ? { ...c, naoLida: false } : c))
      )
      setChatJanelaAtiva({ ...encontrada, naoLida: false })
      setIsMinimizado(false)

      // Carrega histórico atualizado da API
      const idParaBuscar = encontrada.conversaId || Number(encontrada.id)
      if (idParaBuscar > 0) {
        try {
          const msgs = await chatService.listarMensagens(idParaBuscar)
          if (Array.isArray(msgs)) {
            const msgsMapeadas: MensagemItem[] = msgs.map((m) => ({
              id: String(m.id),
              remetente: m.remetente,
              texto: m.texto,
              imagemUrl: m.imagemUrl,
              imagemLegenda: m.imagemLegenda,
              hora: m.hora,
              status: m.status,
              isProposta: m.isProposta,
            }))
            setChatJanelaAtiva((prev) =>
              prev && (prev.id === encontrada.id || prev.conversaId === idParaBuscar)
                ? { ...prev, mensagens: msgsMapeadas }
                : prev
            )
            setConversas((prev) =>
              prev.map((c) =>
                c.id === encontrada.id || c.conversaId === idParaBuscar
                  ? { ...c, mensagens: msgsMapeadas }
                  : c
              )
            )
          }
        } catch (err) {
          console.warn('Histórico carregado localmente:', err)
        }
      }
    } else if (!isNaN(idNum) && idNum > 0) {
      // Tenta iniciar ou resgatar conversa no backend para obter dados reais do prestador
      try {
        const resp = await chatService.iniciarConversa(idNum)
        if (resp) {
          const novaConversa: Conversa = {
            id: String(resp.conversaId || resp.id),
            conversaId: resp.conversaId,
            prestadorId: resp.prestadorId,
            nome: resp.nome || 'Profissional',
            profissao: resp.profissao || 'Prestador de Serviços',
            avatar: resp.avatar || '',
            online: resp.online ?? false,
            statusTexto: resp.statusTexto || 'Disponível',
            naoLida: false,
            ultimaMensagem: resp.ultimaMensagem || '',
            tempo: resp.tempo || 'Agora',
            pedidoNumero: resp.pedidoNumero,
            mensagens: (resp.mensagens || []).map((m) => ({
              id: String(m.id),
              remetente: m.remetente,
              texto: m.texto,
              imagemUrl: m.imagemUrl,
              imagemLegenda: m.imagemLegenda,
              hora: m.hora,
              status: m.status,
              isProposta: m.isProposta,
            })),
          }

          setConversas((prev) => {
            const index = prev.findIndex((c) => c.id === novaConversa.id || c.prestadorId === novaConversa.prestadorId)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = novaConversa
              return updated
            }
            return [novaConversa, ...prev]
          })
          setChatJanelaAtiva(novaConversa)
          setIsMinimizado(false)
          return
        }
      } catch (e) {
        console.warn('Tentativa de iniciar conversa via API falhou, usando fallback:', e)
      }

      // Se falhar a API, usa fallback sem mockar dados falsos
      const novoId = String(conversaIdOuPrestadorId)
      const novaConversa: Conversa = {
        id: novoId,
        prestadorId: idNum,
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
    if (chatJanelaAtiva) {
      setConversas((prev) => {
        const idx = prev.findIndex((c) => c.id === chatJanelaAtiva.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...chatJanelaAtiva }
          return updated
        }
        return [chatJanelaAtiva, ...prev]
      })
    }
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

    // Otimista em ambos os estados
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

    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversaId
          ? {
              ...c,
              mensagens: [...c.mensagens, novaMsg],
              ultimaMensagem: texto.trim(),
              tempo: 'Agora',
            }
          : c
      )
    )

    const idNumerico = Number(conversaId)
    if (!isNaN(idNumerico) && idNumerico > 0) {
      try {
        const resp = await chatService.enviarMensagem(idNumerico, { texto: texto.trim() })
        const statusReal = resp.status || 'Entregue'
        const idReal = resp.id ? String(resp.id) : novaMsg.id

        setChatJanelaAtiva((prev) => {
          if (prev && prev.id === conversaId) {
            return {
              ...prev,
              mensagens: prev.mensagens.map((m) =>
                m.id === novaMsg.id ? { ...m, id: idReal, status: statusReal } : m
              ),
            }
          }
          return prev
        })

        setConversas((prev) =>
          prev.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  mensagens: c.mensagens.map((m) =>
                    m.id === novaMsg.id ? { ...m, id: idReal, status: statusReal } : m
                  ),
                }
              : c
          )
        )
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
        marcarComoLido,
        marcarTodasComoLidas,
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
