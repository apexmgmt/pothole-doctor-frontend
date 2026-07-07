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
  FORGOT_PASSWORD,
  IMPERSONATE,
  PROFILE_CHANGE_PASSWORD,
  PROFILE_CHANGE_PASSWORD_TENANT,
  PROFILE_LAST_ACTIVITY,
  PROFILE_LAST_ACTIVITY_TENANT,
  PROFILE_PICTURE,
  PROFILE_PICTURE_TENANT,
  PROFILE_UPDATE,
  PROFILE_UPDATE_TENANT,
  RESET_PASSWORD,
  VERIFY_FORGOT_PASSWORD_OTP
} from '@/constants/api'
import { isTenant } from '@/utils/utility'
import CookieService from '../app/cookie.service'
import { CookieKeys } from '@/constants/cookies'
import { handleRequest } from '@/services/api/base.service'
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

      const response = await handleRequest(API_URL + (isTenantApi ? AUTH_LOGIN_TENANT : AUTH_LOGIN), {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static impersonate = async (user_id: string) => {
    try {
      const response = await handleRequest(API_URL + IMPERSONATE + user_id, {
        requiresAuth: true,
        method: 'POST'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static refreshToken = async (refresh_token?: string) => {
    // If not provided, try to get from CookieService (client-side only)
    if (!refresh_token) {
      refresh_token = await CookieService.get(CookieKeys.REFRESH_TOKEN)
    }

    if (!refresh_token) throw new Error('No refresh token available')

    // Call the internal API route which handles caching/deduplication
    // Server-side fetch requires absolute URL; client-side uses relative
    const baseUrl = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' : ''

    try {
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ refresh_token })
      })

      let data: any

      try {
        data = await response.json()
      } catch {
        data = null
      }

      return data
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

      const response = await handleRequest(API_URL + (isTenantApi ? AUTH_LOGOUT_TENANT : AUTH_LOGOUT), {
        requiresAuth: true,
        method: 'POST'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static getAuthDetails = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? AUTH_ME_TENANT : AUTH_ME), {
        requiresAuth: true,
        method: 'GET'
      })

      const data = response

      // CookieService.store(CookieKeys.USER, data?.data) // Handled by CheckAuthProvider and Server Actions now

      return data
    } catch (error) {
      throw error
    }
  }

  static updateProfilePicture = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PROFILE_PICTURE_TENANT : PROFILE_PICTURE), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static updateProfileDetails = async (payload: ProfileDetailsPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PROFILE_UPDATE_TENANT : PROFILE_UPDATE), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static updatePassword = async (payload: ProfileChangePasswordPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PROFILE_CHANGE_PASSWORD_TENANT : PROFILE_CHANGE_PASSWORD),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  static getActivity = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PROFILE_LAST_ACTIVITY_TENANT : PROFILE_LAST_ACTIVITY),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * End session by token ID
   * @param tokenId string - token ID to end
   * @returns Promise<any>
   */
  static endSession = async (tokenId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PROFILE_LAST_ACTIVITY_TENANT : PROFILE_LAST_ACTIVITY) + tokenId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Logout from all devices
   * @returns Promise<any>
   */
  static logoutAllDevices = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PROFILE_LAST_ACTIVITY_TENANT : PROFILE_LAST_ACTIVITY),
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Forgot Password API call
   * @param email string - user's email
   * @returns Promise<any>
   */
  static forgotPassword = async (email: string) => {
    const isTenantApi = await isTenant()

    try {
      const response = await handleRequest(API_URL + FORGOT_PASSWORD(isTenantApi), {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ email })
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Verify Forgot Password OTP API call
   * @param email string - user's email
   * @param otp string - OTP received by user
   * @returns Promise<any>
   */
  static verifyForgotPasswordOtp = async (email: string, otp: string) => {
    const isTenantApi = await isTenant()

    try {
      const response = await handleRequest(API_URL + VERIFY_FORGOT_PASSWORD_OTP(isTenantApi), {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ email, otp })
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Reset Password API call
   * @param email string - user's email
   * @param password string - new password
   * @param password_confirmation string - confirmation of the new password
   * @param reset_token string - token received for password reset
   * @returns Promise<any>
   */
  static resetPassword = async (
    email: string,
    password: string,
    password_confirmation: string,
    reset_token: string
  ) => {
    const isTenantApi = await isTenant()

    try {
      const response = await handleRequest(API_URL + RESET_PASSWORD(isTenantApi), {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ email, password, password_confirmation, reset_token })
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
