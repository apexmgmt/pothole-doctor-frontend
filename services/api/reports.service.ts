import { API_URL, SALESMAN_CHART_REPORT } from '@/constants/api'
import apiInterceptor from './api.interceptor'

export default class ReportService {
  /**
   * Fetches salesman chart report data with optional filters for starting date, end date, and location IDs.
   * @param params - Optional parameters for filtering the report data
   * @returns A promise that resolves to the report data
   */
  static getSalesmanChartReport = async (params?: {
    starting_date?: string
    staring_date?: string
    end_date?: string
    location_ids?: string[]
  }) => {
    try {
      const queryParams = new URLSearchParams()

      if (params?.starting_date ?? params?.staring_date) {
        queryParams.append('starting_date', params?.starting_date ?? params.staring_date ?? '')
      }

      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.location_ids) params.location_ids.forEach(id => queryParams.append('location_ids[]', id))

      const response = await apiInterceptor(API_URL + SALESMAN_CHART_REPORT + '?' + queryParams.toString(), {
        method: 'GET',
        requiresAuth: true
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
