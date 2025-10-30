import { AUTH_LOGIN } from '@/constants/api'
import { getApiUrl } from '@/utils/utility'

export default class AuthService {
  /**
   * Auth Login
   * @param email 
   * @param password 
   * @returns 
   */
  static login = async (email: string, password: string) => {
    try {
      const payload: object = {
        username: email,
        password: password
      }

      const apiUrl: string = await getApiUrl()
      const response = await fetch(apiUrl + AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to login')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static refreshToken = async () => {

  }

  static logout = async () => {

  }

  static getUserDetails = async () => {

  }

}
