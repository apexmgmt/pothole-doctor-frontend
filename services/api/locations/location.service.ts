import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LOCATIONS } from '@/constants/api'

export default class LocationService {
  /**Locations DataTable API */
  static index = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LOCATIONS, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['locations'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch locations')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
