import { useNavigate } from 'react-router-dom'
import { Card, ErrorState, PageHeader, Spinner, StatCard } from '../../core/components/ui'
import { useAsync } from '../../core/hooks/useAsync'
import { adminService } from '../../features/admin/services'

export default function AdminDashboard() {
  const nav = useNavigate()
  const { data, loading, error, reload } = useAsync(() => adminService.resumo(), [])

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral da plataforma Conecta" />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <>
          <div className="stats">
            <StatCard label="Usuários" value={data.totalUsuarios} icon="users" to={() => nav('/admin/usuarios')} />
            <StatCard label="Prestadores" value={data.prestadores} icon="shield" tone="ok" to={() => nav('/admin/usuarios?tipo=PRESTADOR')} />
            <StatCard label="Clientes" value={data.clientes} icon="users" tone="info" to={() => nav('/admin/usuarios?tipo=CLIENTE')} />
            <StatCard label="Contas bloqueadas" value={data.bloqueados} icon="ban" tone="danger" to={() => nav('/admin/usuarios?status=BLOQUEADO')} />
            <StatCard label="Documentos pendentes" value={data.documentosPendentes} icon="file" tone="warn" to={() => nav('/admin/documentos')} />
            <StatCard label="Denúncias em aberto" value={data.denunciasAbertas} icon="flag" tone="danger" to={() => nav('/admin/denuncias')} />
          </div>
          <Card title="Pendências">
            <ul className="todo">
              <li><strong>{data.documentosPendentes}</strong> documentos aguardando análise <button className="link" onClick={() => nav('/admin/documentos')}>Analisar</button></li>
              <li><strong>{data.denunciasAbertas}</strong> denúncias aguardando moderação <button className="link" onClick={() => nav('/admin/denuncias')}>Moderar</button></li>
            </ul>
          </Card>
        </>
      )}
    </>
  )
}
