import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ME, AUTH_REFRESH_TOKEN } from '@/constants/api'
import { getApiUrl } from '@/utils/utility'
import CookieService from '../storage/cookie.service'
import apiInterceptor from './api.interceptor'
import { redirect } from 'next/navigation'

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
          Accept: 'application/json'
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

  static refreshToken = async (refresh_token?: string) => {
    // If not provided, try to get from CookieService (client-side only)
    if (!refresh_token) {
      refresh_token = CookieService.get('refresh_token')
    }
    if (!refresh_token) throw new Error('No refresh token available')

    try {
      const apiUrl: string = await getApiUrl()
      const payload: object = { refresh_token: refresh_token }
      const response = await fetch(apiUrl + AUTH_REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to refresh token')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Logout and redirect to login.
   * Works on both server and client, no props needed.
   */
  static logout = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      await apiInterceptor(apiUrl + AUTH_LOGOUT, {
        requiresAuth: true,
        method: 'POST'
      })
    } catch (error) {
      // ignore API errors for logout, proceed to clear and redirect
    } finally {
      CookieService.clear()

      // Server-side redirect
      if (typeof window === 'undefined') {
        redirect('/login')
        return
      }

      // Client-side redirect
      window.location.href = '/login'
    }
  }

  static getUserDetails = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + AUTH_ME, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()
        return errorData.message || 'Failed to get user details'
      }

      const data = await response.json()
      CookieService.store('user', data?.data)
      return data
    } catch (error) {
      throw error
    }
  }
}
