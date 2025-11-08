import { getApiUrl } from "@/utils/utility"
import apiInterceptor from "./api.interceptor"
import { COMPANIES } from "@/constants/api"

export default class CompanyService {
  static store = async (payload: object) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMPANIES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return errorData.message || 'Failed to create company'
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
