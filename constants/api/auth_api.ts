/** POST: Login with {email, password} */
export const AUTH_LOGIN: string = '/v1/auth/login'
export const AUTH_LOGIN_TENANT: string = '/v1/tenant/auth/login'

/** POST: Refresh Tokens with {refresh_token} */
export const AUTH_REFRESH_TOKEN: string = '/v1/auth/refresh'
export const AUTH_REFRESH_TOKEN_TENANT: string = '/v1/tenant/auth/refresh'

/** GET: Get auth user details */
export const AUTH_ME: string = '/v1/auth/me'
export const AUTH_ME_TENANT: string = '/v1/tenant/auth/me'

/** POST: Auth user Logout */
export const AUTH_LOGOUT: string = '/v1/auth/logout'
export const AUTH_LOGOUT_TENANT: string = '/v1/tenant/auth/logout'

export const PROFILE_PICTURE: string = '/v1/profile-picture' // POST
export const PROFILE_PICTURE_TENANT: string = '/v1/tenant/profile-picture' // POST
export const PROFILE_UPDATE: string = '/v1/profile-update' // PUT
export const PROFILE_UPDATE_TENANT: string = '/v1/tenant/profile-update' // PUT
export const PROFILE_CHANGE_PASSWORD: string = '/v1/change-password' // POST
export const PROFILE_CHANGE_PASSWORD_TENANT: string = '/v1/tenant/change-password' // POST
export const PROFILE_LAST_ACTIVITY: string = '/v1/last-activity' // GET
export const PROFILE_LAST_ACTIVITY_TENANT: string = '/v1/tenant/last-activity' // GET

export const IMPERSONATE: string = '/v1/auth/impersonate/' // POST + {user_id}

/**
 * Forgot Password API endpoint
 * @param isTenant boolean - default false
 * @method POST {email}
 * @returns string - isTenant ? '/v1/tenant/auth/forgot-password' : '/v1/auth/forgot-password'
 */
export const FORGOT_PASSWORD = (isTenant:boolean = false): string => {
    return isTenant ? '/v1/tenant/auth/forgot-password' : '/v1/auth/forgot-password'
}

/**
 * Verify Forgot Password OTP API endpoint
 * @param isTenant boolean - default false
 * @method POST {email, otp}
 * @returns string - isTenant ? '/v1/tenant/auth/verify-forgot-password-otp' : '/v1/auth/verify-forgot-password-otp'
 */
export const VERIFY_FORGOT_PASSWORD_OTP = (isTenant: boolean = false): string => {
    return isTenant ? '/v1/tenant/auth/verify-forgot-password-otp' : '/v1/auth/verify-forgot-password-otp'
}

/**
 * Reset Password API endpoint
 * @param isTenant boolean - default false
 * @method POST {email, password, password_confirmation, reset_token}
 * @returns string - isTenant ? '/v1/tenant/auth/reset-password' : '/v1/auth/reset-password'
 */
export const RESET_PASSWORD = (isTenant: boolean = false): string => {
    return isTenant ? '/v1/tenant/auth/reset-password' : '/v1/auth/reset-password'
}
