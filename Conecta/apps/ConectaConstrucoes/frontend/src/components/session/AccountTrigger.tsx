import type { ReactNode } from 'react'
import { useSession } from '../../context/SessionContext'

interface Props {
  className?: string
  title?: string
  children: ReactNode
}

/** Botão que abre o menu único de conta (troca de perfil / sair). */
export default function AccountTrigger({ className, title = 'Minha conta', children }: Props) {
  const { abrirMenuConta } = useSession()
  return (
    <button type="button" className={className} title={title} aria-label={title} onClick={abrirMenuConta}>
      {children}
    </button>
  )
}
