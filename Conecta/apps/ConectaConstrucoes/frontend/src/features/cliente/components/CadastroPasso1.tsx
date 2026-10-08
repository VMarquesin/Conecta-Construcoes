import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  User,
} from 'lucide-react'
import Input from '../../../core/components/ui/Input'
import { mascararCelular } from '../../../core/utils/mascaras'

const esquemaPasso1 = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo'),
  email: z.string().min(1, 'O e-mail é obrigatório').email('Informe um e-mail válido'),
  celular: z
    .string()
    .refine((valor) => valor.replace(/\D/g, '').length === 11, 'Informe um celular válido com DDD'),
  senha: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/\d/, 'A senha deve conter pelo menos 1 número'),
})

export type DadosPasso1 = z.infer<typeof esquemaPasso1>

interface CadastroPasso1Props {
  onNext: (dados: DadosPasso1) => void
}

function RequisitoSenha({ atendido, texto }: { atendido: boolean; texto: string }) {
  return (
    <span className={`flex items-center gap-1 ${atendido ? 'text-emerald-600' : 'text-slate-400'}`}>
      <CheckCircle2 size={12} /> {texto}
    </span>
  )
}

export default function CadastroPasso1({ onNext }: CadastroPasso1Props) {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DadosPasso1>({
    resolver: zodResolver(esquemaPasso1),
    defaultValues: { nomeCompleto: '', email: '', celular: '', senha: '' },
  })

  const senha = watch('senha') ?? ''

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <span className="flex w-fit items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
          <Lock size={12} /> 100% Seguro &amp; Rápido
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Criar conta de Cliente</h1>
        <p className="text-sm text-slate-500">
          Preencha seus dados básicos para encontrar profissionais qualificados em Tupã.
        </p>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <Input
          rotulo="Nome Completo"
          dica="Obrigatório"
          placeholder="Ex: Matheus Oliveira"
          autoComplete="name"
          iconeEsquerda={<User size={18} />}
          erro={errors.nomeCompleto?.message}
          {...register('nomeCompleto')}
        />

        <Input
          rotulo="E-mail"
          dica="Para orçamentos"
          type="email"
          placeholder="seu.email@exemplo.com"
          autoComplete="email"
          iconeEsquerda={<Mail size={18} />}
          erro={errors.email?.message}
          {...register('email')}
        />

        <Controller
          name="celular"
          control={control}
          render={({ field }) => (
            <Input
              rotulo="Celular / WhatsApp"
              dica={
                <span className="flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-600">
                  <MessageSquare size={11} /> Verificação por SMS
                </span>
              }
              type="tel"
              inputMode="numeric"
              placeholder="(14) 99876-5432"
              autoComplete="tel"
              iconeEsquerda={<MessageSquare size={18} />}
              erro={errors.celular?.message}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onChange={(evento) => field.onChange(mascararCelular(evento.target.value))}
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <Input
            rotulo="Criar Senha"
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="Crie uma senha segura"
            autoComplete="new-password"
            iconeEsquerda={<Lock size={18} />}
            iconeDireita={
              <button
                type="button"
                onClick={() => setMostrarSenha((atual) => !atual)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="flex cursor-pointer items-center"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            erro={errors.senha?.message}
            {...register('senha')}
          />
          <div className="flex items-center gap-3 text-[11px]">
            <RequisitoSenha atendido={senha.length >= 8} texto="Mínimo 8 caracteres" />
            <RequisitoSenha atendido={/\d/.test(senha)} texto="1 número" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <MapPin size={18} />
        </span>
        <div className="text-xs">
          <p className="font-bold text-slate-800">Atendimento focado em Tupã e região</p>
          <p className="text-slate-500">Conecte-se com mais de 300 profissionais avaliados.</p>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Ao continuar, você concorda com nossos{' '}
        <a href="#" className="underline">Termos de Uso</a> e{' '}
        <a href="#" className="underline">Política de Privacidade</a>.
      </p>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
      >
        Continuar <ArrowRight size={16} />
      </button>

      <p className="text-center text-sm text-slate-500">
        Já possui uma conta?{' '}
        <Link to="/login" className="cursor-pointer font-semibold text-blue-700 hover:underline">
          Fazer login
        </Link>
      </p>
    </form>
  )
}
