import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  CheckCircle2,
  Crosshair,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Input from '../../../core/components/ui/Input'
import { mascararCep } from '../../../core/utils/mascaras'
import { buscarEnderecoPorCep } from '../services/viaCepService'
import { cadastrarCliente } from '../services/clienteService'
import type { DadosPasso1 } from './CadastroPasso1'

const esquemaPasso2 = z.object({
  cep: z.string().refine((valor) => valor.replace(/\D/g, '').length === 8, 'Informe um CEP válido'),
  rua: z.string().trim().min(1, 'A rua é obrigatória'),
  numero: z.string().trim().min(1, 'Obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().trim().min(1, 'O bairro é obrigatório'),
  cidade: z.string().min(1, 'Busque um CEP válido para preencher a cidade'),
  estado: z.string().min(1),
})

type DadosPasso2 = z.infer<typeof esquemaPasso2>

interface Coordenadas {
  latitude: number
  longitude: number
}

interface CadastroPasso2Props {
  dadosPasso1: DadosPasso1
  onConcluido: () => void
}

const somenteNumeros = (valor: string) => valor.replace(/\D/g, '')

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600">
      {children}
    </span>
  )
}

export default function CadastroPasso2({ dadosPasso1, onConcluido }: CadastroPasso2Props) {
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cepEncontrado, setCepEncontrado] = useState(false)
  const [travados, setTravados] = useState({ rua: false, bairro: false })
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null)
  const [mensagemGps, setMensagemGps] = useState('')
  const [erroEnvio, setErroEnvio] = useState('')
  const ultimoCepBuscado = useRef('')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DadosPasso2>({
    resolver: zodResolver(esquemaPasso2),
    defaultValues: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  })

  const cidade = watch('cidade')
  const estado = watch('estado')

  function limparEnderecoAutomatico() {
    setValue('rua', '')
    setValue('bairro', '')
    setValue('cidade', '')
    setValue('estado', '')
    setCepEncontrado(false)
    setTravados({ rua: false, bairro: false })
  }

  async function aoSairDoCep(cepDigitado: string) {
    const cep = somenteNumeros(cepDigitado)

    if (cep.length !== 8 || cep === ultimoCepBuscado.current) return
    ultimoCepBuscado.current = cep

    setBuscandoCep(true)
    clearErrors('cep')

    try {
      const endereco = await buscarEnderecoPorCep(cep)

      if (!endereco) {
        limparEnderecoAutomatico()
        setError('cep', { message: 'CEP não encontrado' })
        return
      }

      setValue('rua', endereco.rua, { shouldValidate: !!endereco.rua })
      setValue('bairro', endereco.bairro, { shouldValidate: !!endereco.bairro })
      setValue('cidade', endereco.cidade, { shouldValidate: true })
      setValue('estado', endereco.estado)
      setTravados({ rua: !!endereco.rua, bairro: !!endereco.bairro })
      setCepEncontrado(true)
    } catch {
      limparEnderecoAutomatico()
      ultimoCepBuscado.current = ''
      setError('cep', { message: 'Não foi possível buscar o CEP. Tente novamente.' })
    } finally {
      setBuscandoCep(false)
    }
  }

  function usarLocalizacaoAtual() {
    if (!navigator.geolocation) {
      setMensagemGps('Seu navegador não suporta geolocalização.')
      return
    }

    setMensagemGps('Obtendo localização...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordenadas({ latitude: coords.latitude, longitude: coords.longitude })
        setMensagemGps('Localização capturada com sucesso!')
      },
      () => setMensagemGps('Não foi possível obter sua localização. Informe o CEP.'),
    )
  }

  async function aoEnviar(dados: DadosPasso2) {
    setErroEnvio('')

    try {
      await cadastrarCliente({
        nomeCompleto: dadosPasso1.nomeCompleto,
        email: dadosPasso1.email,
        celular: somenteNumeros(dadosPasso1.celular),
        senha: dadosPasso1.senha,
        endereco: {
          cep: somenteNumeros(dados.cep),
          rua: dados.rua,
          numero: dados.numero,
          complemento: dados.complemento ?? '',
          bairro: dados.bairro,
          cidade: dados.cidade,
          estado: dados.estado,
          latitude: coordenadas?.latitude ?? null,
          longitude: coordenadas?.longitude ?? null,
        },
      })
      onConcluido()
    } catch (erro) {
      setErroEnvio(erro instanceof Error ? erro.message : 'Erro inesperado ao cadastrar.')
    }
  }

  const cadeado = <Lock size={16} />

  return (
    <form onSubmit={handleSubmit(aoEnviar)} noValidate className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Onde você precisa de serviços?</h1>
        <p className="text-sm text-slate-500">
          Sua localização exata nos ajuda a encontrar os prestadores mais próximos e calcular
          orçamentos precisos.
        </p>
      </section>

      <section className="flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <span className="flex items-center gap-1 self-start text-[11px] font-semibold text-blue-700">
          <ShieldCheck size={12} /> Localização Segura Conecta
        </span>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            <MapPin size={22} />
          </span>
        </div>
        <button
          type="button"
          onClick={usarLocalizacaoAtual}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <Crosshair size={16} /> Usar minha localização atual (GPS)
        </button>
        {mensagemGps && <p className="text-[11px] text-slate-500">{mensagemGps}</p>}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <Controller
            name="cep"
            control={control}
            render={({ field }) => (
              <Input
                rotulo="CEP"
                dica={
                  buscandoCep ? (
                    <Tag>
                      <Loader2 size={11} className="animate-spin" /> Busca Automática
                    </Tag>
                  ) : undefined
                }
                inputMode="numeric"
                placeholder="00000-000"
                autoComplete="postal-code"
                iconeDireita={
                  cepEncontrado ? <CheckCircle2 size={18} className="text-emerald-500" /> : undefined
                }
                erro={errors.cep?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onChange={(evento) => field.onChange(mascararCep(evento.target.value))}
                onBlur={(evento) => {
                  field.onBlur()
                  aoSairDoCep(evento.target.value)
                }}
              />
            )}
          />
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles size={11} /> Preencheremos o restante dos dados para você.
          </p>
        </div>

        <Input
          rotulo="Rua / Avenida"
          dica="ViaCEP"
          placeholder="Nome da rua"
          disabled={buscandoCep || travados.rua}
          iconeDireita={buscandoCep || travados.rua ? cadeado : undefined}
          erro={errors.rua?.message}
          {...register('rua')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            rotulo="Número *"
            inputMode="numeric"
            placeholder="Ex: 1200"
            erro={errors.numero?.message}
            {...register('numero')}
          />
          <Input
            rotulo="Complemento"
            placeholder="Apto 32 / Bloco B"
            {...register('complemento')}
          />
        </div>

        <Input
          rotulo="Bairro"
          placeholder="Bairro"
          disabled={buscandoCep || travados.bairro}
          iconeDireita={buscandoCep || travados.bairro ? cadeado : undefined}
          erro={errors.bairro?.message}
          {...register('bairro')}
        />

        <Input
          rotulo="Cidade e Estado"
          dica={cepEncontrado ? <Tag>Integrado</Tag> : undefined}
          placeholder="Preenchido pelo CEP"
          disabled
          iconeEsquerda={<Building2 size={18} />}
          value={cidade ? `${cidade} - ${estado}` : ''}
          readOnly
          erro={errors.cidade?.message}
        />
      </section>

      {erroEnvio && (
        <p role="alert" className="text-center text-sm text-red-500">
          {erroEnvio}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || buscandoCep}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando...' : 'Concluir Cadastro'} <CheckCircle2 size={16} />
      </button>

      <p className="flex items-center justify-center gap-1 text-center text-[11px] text-slate-400">
        <ShieldCheck size={12} /> Seus dados estão protegidos.
      </p>
    </form>
  )
}
