import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import CadastroPasso1 from '../components/CadastroPasso1'
import CadastroPasso2 from '../components/CadastroPasso2'
import type { DadosPasso1 } from '../components/CadastroPasso1'

const TOTAL_ETAPAS = 2

export default function CadastroClientePage() {
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [dadosPasso1, setDadosPasso1] = useState<DadosPasso1 | null>(null)
  const [cadastroConcluido, setCadastroConcluido] = useState(false)

  function avancar(dados: DadosPasso1) {
    setDadosPasso1(dados)
    setEtapaAtual(2)
  }

  function voltar() {
    setEtapaAtual((etapa) => Math.max(1, etapa - 1))
  }

  const percentual = (etapaAtual / TOTAL_ETAPAS) * 100

  if (cadastroConcluido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">Cadastro concluído!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Tudo certo, {dadosPasso1?.nomeCompleto}. Agora você já pode encontrar profissionais em Tupã.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen justify-center bg-slate-50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={voltar}
            disabled={etapaAtual === 1}
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-sm disabled:cursor-default disabled:opacity-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-600">
              Etapa {etapaAtual} de {TOTAL_ETAPAS}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        </header>

        {etapaAtual === 1 && <CadastroPasso1 onNext={avancar} />}

        {etapaAtual === 2 && dadosPasso1 && (
          <CadastroPasso2
            dadosPasso1={dadosPasso1}
            onConcluido={() => setCadastroConcluido(true)}
          />
        )}
      </div>
    </main>
  )
}
