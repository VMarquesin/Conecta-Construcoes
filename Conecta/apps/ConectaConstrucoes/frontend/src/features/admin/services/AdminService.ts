import type {
  AcaoModeracao, Denuncia, Documento, FiltroUsuarios, ResumoAdmin, Role, Usuario,
} from '../types'

/** Contrato consumido pelas telas. Implementado por http (API real) e mock. */
export interface AdminService {
  resumo(): Promise<ResumoAdmin>
  listarUsuarios(f: FiltroUsuarios): Promise<Usuario[]>
  obterUsuario(id: string): Promise<Usuario>
  atualizarUsuario(id: string, dados: Pick<Usuario, 'nome' | 'email' | 'telefone' | 'cidade'>): Promise<Usuario>
  bloquearUsuario(id: string, motivo: string): Promise<Usuario>
  desbloquearUsuario(id: string): Promise<Usuario>
  listarRoles(): Promise<Role[]>
  atribuirRole(usuarioId: string, roleId: string): Promise<Usuario>
  removerRole(usuarioId: string, roleId: string): Promise<Usuario>
  listarDocumentosPendentes(): Promise<Documento[]>
  aprovarDocumento(id: string): Promise<void>
  rejeitarDocumento(id: string, motivo: string): Promise<void>
  listarDenuncias(): Promise<Denuncia[]>
  moderarDenuncia(id: string, acao: AcaoModeracao, observacao: string): Promise<Denuncia>
}
