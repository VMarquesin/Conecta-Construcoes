import { http } from '../../../core/api/http'

export interface CadastroClienteForm {
  nomeCompleto: string
  email: string
  celular: string
  senha: string
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface RegistroResponse {
  id: number
  nome: string
  email: string
  perfil: string
  token: string
  expiracao: string
  roles: string[]
}

export async function cadastrarCliente(dados: CadastroClienteForm): Promise<RegistroResponse> {
  const payload = {
    nome: dados.nomeCompleto.trim(),
    email: dados.email.trim(),
    senha: dados.senha,
    perfil: 'CLIENTE',
    telefone: dados.celular.replace(/\D/g, ''),
    endereco: {
      cep: dados.cep.replace(/\D/g, ''),
      logradouro: dados.rua.trim(),
      numero: dados.numero.trim() || 'S/N',
      complemento: dados.complemento?.trim() || null,
      bairro: dados.bairro.trim(),
      cidade: dados.cidade.trim(),
      estado: dados.estado.trim().toUpperCase() || 'SP',
    },
  }

  return await http<RegistroResponse>('/usuarios/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
