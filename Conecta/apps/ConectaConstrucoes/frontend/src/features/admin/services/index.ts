import { httpAdminService } from './httpAdminService'
import { mockAdminService } from './mockAdminService'

/** Enquanto a CON_004 não estiver pronta, usa mock. Defina VITE_USE_MOCK=false para a API real. */
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
export const adminService = useMock ? mockAdminService : httpAdminService
