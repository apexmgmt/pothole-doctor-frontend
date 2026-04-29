import {
  API_URL,
  AUTH_LOGIN,
  AUTH_LOGIN_TENANT,
  AUTH_LOGOUT,
  AUTH_LOGOUT_TENANT,
  AUTH_ME,
  AUTH_ME_TENANT,
  AUTH_REFRESH_TOKEN,
  AUTH_REFRESH_TOKEN_TENANT,
  IMPERSONATE,
  PROFILE_CHANGE_PASSWORD,
  PROFILE_CHANGE_PASSWORD_TENANT,
  PROFILE_LAST_ACTIVITY,
  PROFILE_LAST_ACTIVITY_TENANT,
  PROFILE_PICTURE,
  PROFILE_PICTURE_TENANT,
  PROFILE_UPDATE,
  PROFILE_UPDATE_TENANT
} from '@/constants/api'
import { isTenant } from '@/utils/utility'
import CookieService from '../app/cookie.service'
import apiInterceptor from './api.interceptor'
import { ProfileChangePasswordPayload, ProfileDetailsPayload } from '@/types'

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

      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? AUTH_LOGIN_TENANT : AUTH_LOGIN), {
        requiresAuth: false,
        method: 'POST',
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

  static impersonate = async (user_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + IMPERSONATE + user_id, {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to impersonate user')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static refreshToken = async (refresh_token?: string) => {
    // If not provided, try to get from CookieService (client-side only)
    if (!refresh_token) {
      refresh_token = await CookieService.get('refresh_token')
    }

    if (!refresh_token) throw new Error('No refresh token available')

    try {
      const payload: object = { refresh_token: refresh_token }
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? AUTH_REFRESH_TOKEN_TENANT : AUTH_REFRESH_TOKEN), {
        requiresAuth: false,
        method: 'POST',
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? AUTH_LOGOUT_TENANT : AUTH_LOGOUT), {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to logout')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getAuthDetails = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? AUTH_ME_TENANT : AUTH_ME), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to get user details')
      }

      const data = await response.json()

      CookieService.store('user', data?.data)

      return data
    } catch (error) {
      throw error
    }
  }

  static updateProfilePicture = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROFILE_PICTURE_TENANT : PROFILE_PICTURE), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update profile picture')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static updateProfileDetails = async (payload: ProfileDetailsPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROFILE_UPDATE_TENANT : PROFILE_UPDATE), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update profile details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static updatePassword = async (payload: ProfileChangePasswordPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PROFILE_CHANGE_PASSWORD_TENANT : PROFILE_CHANGE_PASSWORD),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update profile profile')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getActivity = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PROFILE_LAST_ACTIVITY_TENANT : PROFILE_LAST_ACTIVITY),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to get activity')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static endSession = async (sessionId: string) => {
    // try {
    //   const apiUrl: string = await getApiUrl()
    //   const response = await apiInterceptor(apiUrl + PROFILE_END_SESSION.replace(':id', sessionId), {
    //     requiresAuth: true,
    //     method: 'DELETE'
    //   })
    //   if (!response.ok) {
    //     const errorData = await response.json()
    //     throw new Error(errorData.message || 'Failed to end session')
    //   }
    //   return await response.json()
    // } catch (error) {
    //   throw error
    // }
  }

  static logoutAllDevices = async () => {
    // try {
    //   const apiUrl: string = await getApiUrl()
    //   const response = await apiInterceptor(apiUrl + PROFILE_LOGOUT_ALL_DEVICES, {
    //     requiresAuth: true,
    //     method: 'POST'
    //   })
    //   if (!response.ok) {
    //     const errorData = await response.json()
    //     throw new Error(errorData.message || 'Failed to logout from all devices')
    //   }
    //   return await response.json()
    // } catch (error) {
    //   throw error
    // }
  }
}
