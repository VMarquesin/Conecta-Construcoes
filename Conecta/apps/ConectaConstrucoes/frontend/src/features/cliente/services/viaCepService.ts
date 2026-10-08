export interface EnderecoViaCep {
  rua: string
  bairro: string
  cidade: string
  estado: string
}

interface RespostaViaCep {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoViaCep | null> {
  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

  if (!resposta.ok) throw new Error('Falha ao consultar o ViaCEP')

  const dados: RespostaViaCep = await resposta.json()
  if (dados.erro) return null

  return {
    rua: dados.logradouro ?? '',
    bairro: dados.bairro ?? '',
    cidade: dados.localidade ?? '',
    estado: dados.uf ?? '',
  }
}
