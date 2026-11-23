import { createContext, useContext } from 'react'

export type ToastTone = 'ok' | 'success' | 'error' | 'info' | 'warning'

export interface ToastFn {
  (text: string, tone?: ToastTone): void
  success: (text: string) => void
  error: (text: string) => void
  info: (text: string) => void
  warning: (text: string) => void
}

const defaultToastFn: ToastFn = Object.assign(
  (text: string, tone?: ToastTone) => {
    console.log(`[Toast ${tone || 'info'}]: ${text}`)
  },
  {
    success: (text: string) => console.log(`[Toast success]: ${text}`),
    error: (text: string) => console.log(`[Toast error]: ${text}`),
    info: (text: string) => console.log(`[Toast info]: ${text}`),
    warning: (text: string) => console.log(`[Toast warning]: ${text}`),
  }
)

export const ToastContext = createContext<ToastFn>(defaultToastFn)

export const useToast = () => useContext(ToastContext)
