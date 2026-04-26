import { API_URL, DASHBOARD, DASHBOARD_TENANT } from '@/constants/api'
import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'

export default class DashboardService {
  static get = async () => {
    try {
      const isTenantApi = await isTenant()
      const response = await apiInterceptor(API_URL + (isTenantApi ? DASHBOARD_TENANT : DASHBOARD), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch dashboard data')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
