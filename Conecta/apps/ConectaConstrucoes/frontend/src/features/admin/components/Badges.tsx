import { Badge } from '../../../core/components/ui'
import type { StatusDenuncia, StatusUsuario, TipoUsuario } from '../types'

export function StatusUsuarioBadge({ status }: { status: StatusUsuario }) {
  const map = { ATIVO: ['ok', 'Ativo'], BLOQUEADO: ['danger', 'Bloqueado'], PENDENTE: ['warn', 'Pendente'] } as const
  return <Badge tone={map[status][0]}>{map[status][1]}</Badge>
}

export function TipoUsuarioBadge({ tipo }: { tipo: TipoUsuario }) {
  const map = { CLIENTE: 'Cliente', PRESTADOR: 'Prestador', ADMIN: 'Admin' } as const
  return <Badge tone={tipo === 'ADMIN' ? 'info' : 'neutral'}>{map[tipo]}</Badge>
}

export function StatusDenunciaBadge({ status }: { status: StatusDenuncia }) {
  const map = {
    ABERTA: ['warn', 'Aberta'], EM_ANALISE: ['info', 'Em análise'],
    PROCEDENTE: ['danger', 'Procedente'], IMPROCEDENTE: ['neutral', 'Improcedente'],
  } as const
  return <Badge tone={map[status][0]}>{map[status][1]}</Badge>
}
