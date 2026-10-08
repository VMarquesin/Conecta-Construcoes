/* Aplica a máscara (99) 99999-9999 a um telefone brasileiro. */
export function mascararCelular(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 2) return numeros
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

/* Aplica a máscara 99999-999 a um CEP. */
export function mascararCep(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 8)

  if (numeros.length <= 5) return numeros
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`
}
