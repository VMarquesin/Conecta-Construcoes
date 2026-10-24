import React, { createContext, useContext, useState } from 'react'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import marianaRochaAvatar from '../assets/avatars/mariana_rocha.jpg'
import robertoAvatar from '../assets/avatars/roberto.jpg'
import quadroDisjuntores from '../assets/portfolio/quadro.jpg'

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
  dropdownAberto: boolean
  setDropdownAberto: (aberto: boolean | ((prev: boolean) => boolean)) => void
  toggleDropdown: () => void
  chatJanelaAtiva: Conversa | null
  isMinimizado: boolean
  abrirChat: (conversaIdOuPrestadorId: string | number) => void
  fecharJanela: () => void
  minimizarJanela: () => void
  restaurarJanela: () => void
  enviarMensagem: (conversaId: string, texto: string) => void
  totalNaoLidas: number
}

const CONVERSAS_INICIAIS: Conversa[] = [
  {
    id: 'carlos-silva',
    prestadorId: 1,
    nome: 'Carlos Silva',
    profissao: 'Eletricista Residencial & Predial',
    avatar: carlosAvatar,
    online: true,
    statusTexto: 'Online agora • Responde em ~15 min',
    naoLida: true,
    ultimaMensagem: 'Boa tarde, Matheus! Consigo sim, estou com a agenda livre...',
    tempo: '2 min',
    pedidoNumero: '1042',
    mensagens: [
      {
        id: 'm1',
        remetente: 'usuario',
        texto:
          'Olá Carlos, boa tarde! Gostaria de confirmar se você consegue vir hoje verificar o disjuntor que está desarmando quando ligo o chuveiro.',
        hora: '14:15',
        status: 'Entregue',
      },
      {
        id: 'm2',
        remetente: 'usuario',
        imagemUrl: quadroDisjuntores,
        imagemLegenda: 'quadro_disjuntores.jpg',
        hora: '14:16',
        status: 'Entregue',
      },
      {
        id: 'm3',
        remetente: 'prestador',
        texto:
          'Boa tarde, Matheus! Consigo sim, estou com a agenda livre a partir das 16h. Pelas fotos parece ser um disjuntor de 30A subdimensionado para o chuveiro atual.',
        hora: '14:20',
      },
      {
        id: 'm4',
        remetente: 'prestador',
        isProposta: true,
        hora: '14:22',
      },
    ],
  },
  {
    id: 'mariana-rocha',
    prestadorId: 3,
    nome: 'Mariana Rocha',
    profissao: 'Encanadora Hidráulica',
    avatar: marianaRochaAvatar,
    online: true,
    statusTexto: 'Online há 20 min',
    naoLida: true,
    ultimaMensagem: 'Posso fazer a visita técnica gratuita amanhã pela manhã.',
    tempo: '45 min',
    pedidoNumero: '1043',
    mensagens: [
      {
        id: 'mr1',
        remetente: 'usuario',
        texto: 'Olá Mariana, o sifão da pia está com vazamento constante. Você consegue avaliar?',
        hora: '11:30',
        status: 'Entregue',
      },
      {
        id: 'mr2',
        remetente: 'prestador',
        texto: 'Posso fazer a visita técnica gratuita amanhã pela manhã entre 9h e 11h. Fica bom para você?',
        hora: '11:45',
      },
    ],
  },
  {
    id: 'roberto-mendes',
    prestadorId: 5,
    nome: 'Roberto Mendes',
    profissao: 'Encanador & Desentupimento',
    avatar: robertoAvatar,
    online: false,
    statusTexto: 'Online há 2h',
    naoLida: false,
    ultimaMensagem: 'Perfeito! O agendamento para desobstrução está confirmado.',
    tempo: '2 dias',
    pedidoNumero: '1040',
    mensagens: [
      {
        id: 'rm1',
        remetente: 'usuario',
        texto: 'Roberto, o serviço na tubulação foi agendado para amanhã?',
        hora: 'Ontem 16:00',
        status: 'Lido',
      },
      {
        id: 'rm2',
        remetente: 'prestador',
        texto: 'Perfeito! O agendamento para desobstrução está confirmado para as 10h com a garantia Conecta.',
        hora: 'Ontem 16:15',
      },
    ],
  },
]

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversas, setConversas] = useState<Conversa[]>(CONVERSAS_INICIAIS)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [chatJanelaAtiva, setChatJanelaAtiva] = useState<Conversa | null>(null)
  const [isMinimizado, setIsMinimizado] = useState(false)

  const toggleDropdown = () => {
    setDropdownAberto((prev) => !prev)
  }

  const abrirChat = (conversaIdOuPrestadorId: string | number) => {
    setDropdownAberto(false)

    // Busca por ID da conversa ou por prestadorId
    const encontrada = conversas.find(
      (c) =>
        c.id === conversaIdOuPrestadorId ||
        c.prestadorId === Number(conversaIdOuPrestadorId) ||
        c.nome.toLowerCase().includes(String(conversaIdOuPrestadorId).toLowerCase())
    )

    if (encontrada) {
      // Marca como lida
      setConversas((prev) =>
        prev.map((c) => (c.id === encontrada.id ? { ...c, naoLida: false } : c))
      )
      setChatJanelaAtiva({ ...encontrada, naoLida: false })
      setIsMinimizado(false)
    } else {
      // Se não encontrar, abre a conversa padrão do Carlos Silva
      const padrao = conversas[0]
      setChatJanelaAtiva(padrao)
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

  const enviarMensagem = (conversaId: string, texto: string) => {
    if (!texto.trim()) return

    const now = new Date()
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const novaMsg: MensagemItem = {
      id: Date.now().toString(),
      remetente: 'usuario',
      texto: texto.trim(),
      hora,
      status: 'Entregue',
    }

    setConversas((prev) =>
      prev.map((c) => {
        if (c.id === conversaId) {
          const atualizadas = [...c.mensagens, novaMsg]
          return {
            ...c,
            mensagens: atualizadas,
            ultimaMensagem: texto.trim(),
            tempo: 'Agora',
          }
        }
        return c
      })
    )

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

    // Resposta automática simulada do prestador
    setTimeout(() => {
      const resposta: MensagemItem = {
        id: (Date.now() + 1).toString(),
        remetente: 'prestador',
        texto: 'Combinado! Estou a caminho com todos os equipamentos. Qualquer coisa pode me mandar aqui.',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setConversas((prev) =>
        prev.map((c) => {
          if (c.id === conversaId) {
            return {
              ...c,
              mensagens: [...c.mensagens, resposta],
              ultimaMensagem: resposta.texto || '',
              tempo: 'Agora',
            }
          }
          return c
        })
      )

      setChatJanelaAtiva((prev) => {
        if (prev && prev.id === conversaId) {
          return {
            ...prev,
            mensagens: [...prev.mensagens, resposta],
            ultimaMensagem: resposta.texto || '',
            tempo: 'Agora',
          }
        }
        return prev
      })
    }, 1800)
  }

  const totalNaoLidas = conversas.filter((c) => c.naoLida).length

  return (
    <ChatContext.Provider
      value={{
        conversas,
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
