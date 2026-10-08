import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string
  dica?: ReactNode
  iconeEsquerda?: ReactNode
  iconeDireita?: ReactNode
  erro?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, dica, iconeEsquerda, iconeDireita, erro, className = '', id, ...props },
  ref,
) {
  const idGerado = useId()
  const idInput = id ?? idGerado

  const estiloBorda = erro
    ? 'border-red-500 focus:ring-red-200'
    : 'border-transparent focus:border-blue-600 focus:ring-blue-100'

  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && (
        <div className="flex items-center justify-between">
          <label htmlFor={idInput} className="text-xs font-semibold text-slate-800">
            {rotulo}
          </label>
          {dica && <span className="text-[11px] text-slate-400">{dica}</span>}
        </div>
      )}

      <div className="relative">
        {iconeEsquerda && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {iconeEsquerda}
          </span>
        )}

        <input
          ref={ref}
          id={idInput}
          aria-invalid={!!erro}
          className={`w-full rounded-xl border bg-slate-100 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-200/70 disabled:text-slate-500 ${
            iconeEsquerda ? 'pl-11' : 'pl-4'
          } ${iconeDireita ? 'pr-11' : 'pr-4'} ${estiloBorda} ${className}`}
          {...props}
        />

        {iconeDireita && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {iconeDireita}
          </span>
        )}
      </div>

      {erro && (
        <p role="alert" className="text-xs text-red-500">
          {erro}
        </p>
      )}
    </div>
  )
})

export default Input
