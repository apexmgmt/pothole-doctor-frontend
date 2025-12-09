import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { SKILLS_ALL } from '@/constants/api'

export default class SkillService {
  static getAllSkills = async () => {
    const apiUrl = await getApiUrl()
    try {
      const response = await apiInterceptor(apiUrl + SKILLS_ALL, {
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
