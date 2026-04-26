import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, SKILLS_ALL, SKILLS_ALL_TENANT } from '@/constants/api'

export default class SkillService {
  static getAll = async () => {
    const isTenantApi = await isTenant()

    try {
      const response = await apiInterceptor(API_URL + (isTenantApi ? SKILLS_ALL_TENANT : SKILLS_ALL), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch skills')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
