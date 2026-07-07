'use server'

import { cookies } from 'next/headers'
import { encryptData, decryptData } from '@/utils/encryption'
import { CookieKeys } from '@/constants/cookies'
import { appUrl } from '@/utils/utility'
import { User } from '@/types'

/**
 * Set authentication cookies
 * @param accessToken The access token to set
 * @param refreshToken The refresh token to set
 * @param tokenType The token type
 * @param expiresIn The expiration time in seconds
 * @returns Promise<{ success: boolean; error?: string; }>
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
  tokenType: string = 'Bearer',
  expiresIn?: number
) {
  try {
    const cookieStore = await cookies()

    const accessTokenDuration = expiresIn || 600
    const refreshTokenDuration = Number(process.env.REFRESH_TOKEN_DURATION) || 864000

    if (accessToken) {
      cookieStore.set(CookieKeys.ACCESS_TOKEN, String(accessToken), {
        maxAge: accessTokenDuration,
        httpOnly: false,
        path: '/'
      })
    }

    if (refreshToken) {
      cookieStore.set(CookieKeys.REFRESH_TOKEN, String(refreshToken), {
        maxAge: refreshTokenDuration,
        httpOnly: false,
        path: '/'
      })
    }

    if (tokenType) {
      cookieStore.set(CookieKeys.TOKEN_TYPE, String(tokenType), {
        path: '/',
        httpOnly: false
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in setAuthCookies:', error)

    return { success: false, error: error.message }
  }
}

/**
 * Set user cookie
 * @param cookieStore The Next.js cookie store
 * @param user The user object to encrypt and store
 * @param duration The duration for the cookie
 */
async function setUserCookie(cookieStore: any, user: User, duration: number) {
  cookieStore.set(CookieKeys.USER, await encryptData(user), {
    maxAge: duration,
    httpOnly: false,
    path: '/'
  })
}

/**
 * Set permissions cookies (split into chunks due to size limits)
 * @param cookieStore The Next.js cookie store
 * @param permissions The array of permissions to encrypt and store
 * @param duration The duration for the cookies
 */
async function setPermissionsCookie(cookieStore: any, permissions: string[], duration: number) {
  const encryptedPermissions = await encryptData(permissions)
  const chunkSize = Math.ceil(encryptedPermissions.length / 3)

  const chunk1 = encryptedPermissions.slice(0, chunkSize)
  const chunk2 = encryptedPermissions.slice(chunkSize, chunkSize * 2)
  const chunk3 = encryptedPermissions.slice(chunkSize * 2)

  cookieStore.set(CookieKeys.PERMISSIONS_1, chunk1, { maxAge: duration, path: '/', httpOnly: false })
  cookieStore.set(CookieKeys.PERMISSIONS_2, chunk2, { maxAge: duration, path: '/', httpOnly: false })
  cookieStore.set(CookieKeys.PERMISSIONS_3, chunk3, { maxAge: duration, path: '/', httpOnly: false })
}

/**
 * Set roles cookie
 * @param cookieStore The Next.js cookie store
 * @param roles The array of roles to encrypt and store
 * @param duration The duration for the cookie
 */
async function setRolesCookie(cookieStore: any, roles: string[], duration: number) {
  const encryptedRoles = await encryptData(roles)

  cookieStore.set(CookieKeys.ROLES, encryptedRoles, {
    maxAge: duration,
    httpOnly: false,
    path: '/'
  })
}

/**
 * Set user data cookies
 * @param payload { roles?: string[]; permissions?: string[]; user?: User }
 * @returns Promise<{ success: boolean; error?: string; }>  
 */
export async function setUserDataCookies(payload: { roles?: string[]; permissions?: string[]; user?: User }) {
  try {
    const { roles, permissions, user } = payload
    const cookieStore = await cookies()
    const refreshTokenDuration = Number(process.env.REFRESH_TOKEN_DURATION) || 864000

    if (user) {
      await setUserCookie(cookieStore, user, refreshTokenDuration)
    }

    if (permissions && Array.isArray(permissions)) {
      await setPermissionsCookie(cookieStore, permissions, refreshTokenDuration)
    }

    if (roles && Array.isArray(roles)) {
      await setRolesCookie(cookieStore, roles, refreshTokenDuration)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in setUserDataCookies:', error)

    return { success: false, error: error.message }
  }
}

/**
 * Set all authentication cookies
 * @param accessToken The access token to set
 * @param refreshToken The refresh token to set
 * @param tokenType The token type
 * @param expiresIn The expiration time in seconds
 * @param roles The array of roles to encrypt and store
 * @param permissions The array of permissions to encrypt and store
 * @param user The user object to encrypt and store
 * @returns Promise<{ success: boolean; error?: string; }>
 */
export async function setAllAuthCookies(
  accessToken: string,
  refreshToken: string,
  tokenType: string,
  expiresIn: number,
  roles: string[],
  permissions: string[],
  user: User
) {
  try {
    const authResult = await setAuthCookies(accessToken, refreshToken, tokenType, expiresIn)

    if (!authResult.success) return authResult

    const roleResult = await setUserDataCookies({ roles, permissions, user })

    if (!roleResult.success) return roleResult

    return { success: true }
  } catch (error: any) {
    console.error('Error in setAllAuthCookies:', error)

    return { success: false, error: error.message }
  }
}

/**
 * Process redirect data (decrypt and set cookies in a single server action)
 * @param encryptedData The encrypted authentication data
 * @returns Promise<{ success: boolean; error?: string; user?: any; }>
 */
export async function processRedirectData(encryptedData: string) {
  try {
    const authData = await decryptData(decodeURIComponent(encryptedData))

    if (!authData || !authData.access_token) {
      return { success: false, error: 'Failed to decrypt authentication data' }
    }

    const authResult = await setAuthCookies(
      authData.access_token,
      authData.refresh_token,
      authData.token_type,
      authData.expires_in
    )

    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const AuthService = (await import('@/services/api/auth.service')).default
    const userResponse = await AuthService.getAuthDetails()
    const userData = userResponse?.data || userResponse

    if (!userData || !userData.user) {
      return { success: false, error: 'Failed to fetch user details during redirect' }
    }

    const roleResult = await setUserDataCookies({
      roles: userData.roles || [],
      permissions: userData.permissions || [],
      user: userData.user
    })

    if (!roleResult.success) {
      return { success: false, error: roleResult.error }
    }

    return { success: true, user: userData.user }
  } catch (error: any) {
    console.error('Error in processRedirectData:', error)

    return { success: false, error: error.message }
  }
}

/**
 * Clear all authentication cookies
 * @returns Promise<{ success: boolean }>
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies()

  cookieStore.delete(CookieKeys.ACCESS_TOKEN)
  cookieStore.delete(CookieKeys.REFRESH_TOKEN)
  cookieStore.delete(CookieKeys.TOKEN_TYPE)
  cookieStore.delete(CookieKeys.PERMISSIONS_1)
  cookieStore.delete(CookieKeys.PERMISSIONS_2)
  cookieStore.delete(CookieKeys.PERMISSIONS_3)
  cookieStore.delete(CookieKeys.ROLES)
  cookieStore.delete(CookieKeys.USER)

  return { success: true }
}

export async function generateRedirectUrl(authData: any, domain: string) {
  const encryptedData = await encryptData(authData)
  const redirectUrl = `${appUrl(domain)}/erp/redirecting?data=${encodeURIComponent(encryptedData)}`

  return redirectUrl
}

export async function decryptRedirectUrl(encryptedData: string) {
  try {
    const authData = await decryptData(decodeURIComponent(encryptedData))

    return authData
  } catch (error) {
    return null
  }
}

export async function getAuthTokens() {
  const cookieStore = await cookies()

  return {
    accessToken: cookieStore.get(CookieKeys.ACCESS_TOKEN)?.value,
    tenant: cookieStore.get(CookieKeys.TENANT)?.value
  }
}
