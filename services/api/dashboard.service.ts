import { API_URL, DASHBOARD, DASHBOARD_TENANT } from '@/constants/api'
import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'

export default class DashboardService {
  static get = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? DASHBOARD_TENANT : DASHBOARD), {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
