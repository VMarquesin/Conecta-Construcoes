import { httpAdminService } from './httpAdminService'
import { mockAdminService } from './mockAdminService'

/** Por padrão usa a API C# real (httpAdminService). Defina VITE_USE_MOCK=true para forçar mock em desenvolvimento isolado. */
const useMock = import.meta.env.VITE_USE_MOCK === 'true'
export const adminService = useMock ? mockAdminService : httpAdminService
