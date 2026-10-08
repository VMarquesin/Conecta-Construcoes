import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, Home, Lock, MapPin, Mail, ShieldCheck } from 'lucide-react'
import Input from '../../../core/components/ui/Input'

const esquemaLogin = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Informe um e-mail válido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
  lembrarDeMim: z.boolean().optional(),
})

type DadosLogin = z.infer<typeof esquemaLogin>

function Logo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
        <MapPin size={12} /> Tupã e região
      </span>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
        <Home size={32} />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Conecta<span className="text-blue-600">.</span>
      </h1>
    </div>
  )
}

function BotaoGoogle() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
        <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
      </svg>
      Fazer login com o Google
    </button>
  )
}

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosLogin>({ resolver: zodResolver(esquemaLogin) })

  async function aoEnviar(dados: DadosLogin) {
    // TODO: integrar com a API de autenticação
    console.log(dados)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Bem-vindo de volta!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Encontre os melhores profissionais de Tupã em poucos toques.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit(aoEnviar)}
          noValidate
          className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          <Input
            rotulo="E-mail"
            type="email"
            placeholder="seu.email@exemplo.com"
            autoComplete="email"
            iconeEsquerda={<Mail size={18} />}
            erro={errors.email?.message}
            {...register('email')}
          />

          <Input
            rotulo="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
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

          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-full border-slate-300 accent-blue-600"
                {...register('lembrarDeMim')}
              />
              Lembrar de mim
            </label>
            <a href="#" className="font-semibold text-blue-700 hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
          >
            Entrar <ArrowRight size={16} />
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ou continue com
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <BotaoGoogle />
        </form>

        <footer className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <p>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-blue-700 hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            Ambiente 100% protegido com Conecta Protege
          </p>
        </footer>
      </div>
    </main>
  )
}
