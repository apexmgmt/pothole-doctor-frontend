import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, SKILLS_ALL, SKILLS_ALL_TENANT } from '@/constants/api'

export default class SkillService {
  static getAll = async () => {
    const isTenantApi = await isTenant()

    try {
      const response = await handleRequest(API_URL + (isTenantApi ? SKILLS_ALL_TENANT : SKILLS_ALL), {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
