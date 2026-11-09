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
  const limpo = cep.replace(/\D/g, '')
  if (limpo.length !== 8) return null

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${limpo}/json/`)
    if (!resposta.ok) return null

    const dados: RespostaViaCep = await resposta.json()
    if (dados.erro) return null

    return {
      rua: dados.logradouro ?? '',
      bairro: dados.bairro ?? '',
      cidade: dados.localidade ?? '',
      estado: dados.uf ?? '',
    }
  } catch {
    return null
  }
}
