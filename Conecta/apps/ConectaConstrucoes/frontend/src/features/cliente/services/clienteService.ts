const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export interface CadastroClienteDto {
  nomeCompleto: string
  email: string
  celular: string
  senha: string
  endereco: {
    cep: string
    rua: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    latitude: number | null
    longitude: number | null
  }
}

/** Envia o cadastro completo (Passo 1 + Passo 2) para o backend. */
export async function cadastrarCliente(dados: CadastroClienteDto): Promise<void> {
  const resposta = await fetch(`${URL_API}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível concluir o cadastro. Tente novamente.')
  }
}
