import { useState, useEffect } from 'react'
import { useToast } from '../../core/hooks/useToast'
import { proService } from '../../features/pro/services/proService'
import type { PrestadorPerfilDetalhadoResponse } from '../../features/cliente/services/solicitacaoService'

interface EditarPerfilModalProps {
  aberto: boolean
  onClose: () => void
  prestador: PrestadorPerfilDetalhadoResponse
  onPerfilAtualizado: (dados: {
    valorHora?: number | null
    experienciaAnos?: number | null
    raioAtendimentoKm?: number | null
    bio: string
  }) => void
}

export default function EditarPerfilModal({
  aberto,
  onClose,
  prestador,
  onPerfilAtualizado,
}: EditarPerfilModalProps) {
  const toast = useToast()

  const [valorHora, setValorHora] = useState<number | string>('')
  const [experienciaAnos, setExperienciaAnos] = useState<number | string>('')
  const [raioAtendimentoKm, setRaioAtendimentoKm] = useState<number | string>(15)
  const [bio, setBio] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto && prestador) {
      setValorHora(prestador.valorHora != null ? prestador.valorHora : '')
      const anos = prestador.experienciaAnos ?? prestador.anosExperiencia
      setExperienciaAnos(anos != null ? anos : '')
      setRaioAtendimentoKm(prestador.raioAtendimentoKm != null ? prestador.raioAtendimentoKm : 15)
      setBio(prestador.bio || '')
    }
  }, [aberto, prestador])

  if (!aberto) return null

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (salvando) return

    setSalvando(true)
    try {
      const vHora = valorHora !== '' && !isNaN(Number(valorHora)) ? Number(valorHora) : undefined
      const expAnos = experienciaAnos !== '' && !isNaN(Number(experienciaAnos)) ? Number(experienciaAnos) : undefined
      const raioKm = raioAtendimentoKm !== '' && !isNaN(Number(raioAtendimentoKm)) ? Number(raioAtendimentoKm) : undefined

      await proService.atualizarPerfil(
        {
          valorHora: vHora,
          experienciaAnos: expAnos,
          raioAtendimentoKm: raioKm,
          bio: bio.trim(),
        },
        prestador.id
      )

      toast.success('Perfil comercial atualizado com sucesso!')
      onPerfilAtualizado({
        valorHora: vHora ?? null,
        experienciaAnos: expAnos ?? null,
        raioAtendimentoKm: raioKm ?? null,
        bio: bio.trim(),
      })
      onClose()
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err)
      toast.error(err.message || 'Erro ao salvar alterações no perfil.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#0056d6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Editar Informações Comerciais
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            style={{
              background: '#f8fafc',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '16px',
            }}
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Formulário de Edição */}
        <form onSubmit={handleSalvar} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Três inputs comerciais em grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Valor Hora (R$)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 95"
                value={valorHora}
                onChange={(e) => setValorHora(e.target.value)}
                disabled={salvando}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Experiência (Anos)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                placeholder="Ex: 10"
                value={experienciaAnos}
                onChange={(e) => setExperienciaAnos(e.target.value)}
                disabled={salvando}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Raio Atend. (KM)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                placeholder="Ex: 25"
                value={raioAtendimentoKm}
                onChange={(e) => setRaioAtendimentoKm(e.target.value)}
                disabled={salvando}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Textarea Sobre Mim */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Sobre você (Apresentação na vitrine)
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{bio.length} / 500</span>
            </div>
            <textarea
              rows={4}
              placeholder="Descreva suas qualificações, serviços prestados e garantias..."
              value={bio}
              maxLength={500}
              onChange={(e) => setBio(e.target.value)}
              disabled={salvando}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Rodapé */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              style={{
                background: '#0056d6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 750,
                cursor: salvando ? 'not-allowed' : 'pointer',
                opacity: salvando ? 0.7 : 1,
                boxShadow: '0 3px 10px rgba(0, 86, 214, 0.25)',
              }}
            >
              {salvando ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
