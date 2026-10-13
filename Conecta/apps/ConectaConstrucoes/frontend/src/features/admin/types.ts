export type TipoUsuario = 'CLIENTE' | 'PRESTADOR' | 'ADMIN'
export type StatusUsuario = 'ATIVO' | 'BLOQUEADO' | 'PENDENTE'

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  cidade: string
  tipo: TipoUsuario
  status: StatusUsuario
  criadoEm: string // ISO
  roles: string[] // ids de roles
}

export interface Role {
  id: string
  nome: string
  descricao: string
  permissoes: string[]
}

export type StatusDocumento = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export interface Documento {
  id: string
  usuarioId: string
  usuarioNome: string
  tipoUsuario: Exclude<TipoUsuario, 'ADMIN'>
  tipoDocumento: string
  enviadoEm: string
  status: StatusDocumento
  motivoRejeicao?: string
}

export type StatusDenuncia = 'ABERTA' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE'
export type AcaoModeracao = 'ARQUIVAR' | 'ADVERTIR' | 'BLOQUEAR_USUARIO'

export interface Denuncia {
  id: string
  denuncianteNome: string
  denunciadoId: string
  denunciadoNome: string
  motivo: string
  descricao: string
  criadaEm: string
  status: StatusDenuncia
  acaoTomada?: AcaoModeracao
}

export interface FiltroUsuarios {
  busca?: string
  tipo?: TipoUsuario | ''
  status?: StatusUsuario | ''
  de?: string // yyyy-mm-dd
  ate?: string
}

export interface ResumoAdmin {
  totalUsuarios: number
  prestadores: number
  clientes: number
  bloqueados: number
  documentosPendentes: number
  denunciasAbertas: number
}
