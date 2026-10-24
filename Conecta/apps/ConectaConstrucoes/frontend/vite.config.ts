import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Somente desenvolvimento: responde GET /api/categorias com dados de exemplo (VITE_MOCK_API=true). */
function mockCategorias(): Plugin {
  const dados = [
    { id: 1, nome: 'Elétrica', slug: 'eletrica' },
    { id: 2, nome: 'Encanador', slug: 'encanador' },
    { id: 3, nome: 'Pintura', slug: 'pintura' },
    { id: 4, nome: 'Reformas', slug: 'reformas' },
    { id: 5, nome: 'Limpeza', slug: 'limpeza' },
  ]
  return {
    name: 'mock-categorias',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/categorias', (_req, res) => {
        setTimeout(() => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(dados))
        }, 800)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), ...(env.VITE_MOCK_API === 'true' ? [mockCategorias()] : [])],
  }
})
