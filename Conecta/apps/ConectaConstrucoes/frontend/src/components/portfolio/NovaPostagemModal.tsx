import { useState, useRef, useEffect } from 'react'
import { useToast } from '../../core/hooks/useToast'
import { proService } from '../../features/pro/services/proService'
import type { PortfolioItemDto } from '../../features/cliente/services/solicitacaoService'
import { formatarUrlImagem } from '../../core/utils/imageUtils'

interface NovaPostagemModalProps {
  aberto: boolean
  onClose: () => void
  prestadorId?: number
  onPublicado?: (novoItem: PortfolioItemDto) => void
  itemEmEdicao?: PortfolioItemDto | null
  onAtualizado?: (itemAtualizado: PortfolioItemDto) => void
}

export default function NovaPostagemModal({
  aberto,
  onClose,
  prestadorId,
  onPublicado,
  itemEmEdicao,
  onAtualizado,
}: NovaPostagemModalProps) {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (aberto && itemEmEdicao) {
      setTitulo(itemEmEdicao.titulo || '')
      setDescricao(itemEmEdicao.subtitulo || '')
      setPreviewUrl(itemEmEdicao.imagemUrl || itemEmEdicao.imagem || null)
      setArquivo(null)
    } else if (aberto && !itemEmEdicao) {
      handleLimpar()
    }
  }, [aberto, itemEmEdicao])

  if (!aberto) return null

  const handleLimpar = () => {
    setArquivo(null)
    if (previewUrl && !itemEmEdicao) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setTitulo('')
    setDescricao('')
    setIsDragging(false)
    setEnviando(false)
  }

  const handleFechar = () => {
    if (enviando) return
    handleLimpar()
    onClose()
  }

  const validarESetarArquivo = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem selecionada deve ter no máximo 10 MB.')
      return
    }

    setArquivo(file)
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    if (!titulo.trim()) {
      const nomeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setTitulo(nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1))
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validarESetarArquivo(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validarESetarArquivo(file)
    e.target.value = ''
  }

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!arquivo && !itemEmEdicao) {
      toast.error('Selecione uma imagem para o trabalho.')
      return
    }

    if (!titulo.trim()) {
      toast.error('Informe o título do trabalho realizado.')
      return
    }

    setEnviando(true)

    try {
      if (itemEmEdicao && !arquivo) {
        const itemAtualizado: PortfolioItemDto = {
          ...itemEmEdicao,
          titulo: titulo.trim(),
          subtitulo: descricao.trim() || 'Serviço concluído',
        }
        onAtualizado?.(itemAtualizado)
        toast.success('Publicação atualizada com sucesso!')
        handleFechar()
        return
      }

      const formData = new FormData()
      if (arquivo) formData.append('file', arquivo)
      if (prestadorId) formData.append('prestadorId', String(prestadorId))
      formData.append('titulo', titulo.trim())
      formData.append('detalhe', descricao.trim() || 'Serviço concluído com padrão Conecta Protege')

      const res = await proService.uploadFotoPortfolio(formData, prestadorId)

      const novoItem: PortfolioItemDto = {
        id: itemEmEdicao ? itemEmEdicao.id : res.id,
        titulo: res.titulo || titulo.trim(),
        subtitulo: res.detalhe || descricao.trim() || 'Concluído recentemente',
        imagem: res.imagemUrl || res.url || (itemEmEdicao?.imagem ?? ''),
        imagemUrl: res.imagemUrl || res.url || (itemEmEdicao?.imagemUrl ?? ''),
      }

      if (itemEmEdicao) {
        onAtualizado?.(novoItem)
        toast.success('Publicação atualizada com sucesso!')
      } else {
        onPublicado?.(novoItem)
        toast.success('Foto publicada no seu portfólio com sucesso!')
      }
      handleFechar()
    } catch (err: any) {
      console.error('Erro ao publicar foto:', err)
      toast.error(err.message || 'Erro ao publicar foto no portfólio.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
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
      onClick={handleFechar}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
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
          className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-2">
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
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {itemEmEdicao ? 'Editar Publicação' : 'Nova Publicação no Portfólio'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleFechar}
            disabled={enviando}
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

        {/* Formulário com Drag & Drop */}
        <form onSubmit={handlePublicar} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Área de Drag & Drop / Seleção de Arquivo */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Foto do Trabalho Realizado <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid #e2e8f0',
                  background: '#0f172a',
                }}
              >
                <img
                  src={formatarUrlImagem(previewUrl)}
                  alt="Pré-visualização"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  Trocar foto
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #0056d6' : '2px dashed #cbd5e1',
                  background: isDragging ? '#eff6ff' : '#f8fafc',
                  borderRadius: '16px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#e0edff',
                    color: '#0056d6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>
                    Clique para selecionar ou arraste o arquivo aqui
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Suporta PNG, JPG ou WEBP de até 10 MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Título do Serviço */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Título do Trabalho <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Instalação de Lustre & Iluminação LED"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* 3. Textarea Descrição */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Descrição dos Detalhes
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{descricao.length} / 300</span>
            </div>
            <textarea
              rows={3}
              placeholder="Descreva as etapas, materiais utilizados, acabamento e garantia do serviço..."
              value={descricao}
              maxLength={300}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '11px 14px',
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

          {/* 4. Rodapé com Cancelar e Publicar */}
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
              onClick={handleFechar}
              disabled={enviando}
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
              disabled={enviando || (!arquivo && !itemEmEdicao) || !titulo.trim()}
              style={{
                background: '#0056d6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 750,
                cursor: enviando || (!arquivo && !itemEmEdicao) || !titulo.trim() ? 'not-allowed' : 'pointer',
                opacity: enviando || (!arquivo && !itemEmEdicao) || !titulo.trim() ? 0.6 : 1,
                boxShadow: '0 3px 10px rgba(0, 86, 214, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {enviando ? (
                <>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  <span>{itemEmEdicao ? 'Salvando...' : 'Publicando...'}</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>{itemEmEdicao ? 'Salvar Alterações' : 'Publicar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
