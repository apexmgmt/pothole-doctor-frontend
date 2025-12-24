/** POST: Login with {email, password} */
export const AUTH_LOGIN: string = '/v1/auth/login'

/** POST: Refresh Tokens with {refresh_token} */
export const AUTH_REFRESH_TOKEN: string = '/v1/auth/refresh'

/** GET: Get auth user details */
export const AUTH_ME: string = '/v1/auth/me'

/** POST: Auth user Logout */
export const AUTH_LOGOUT: string = '/v1/auth/logout'

export const PROFILE_PICTURE: string = '/v1/profile-picture' // POST
export const PROFILE_UPDATE: string = '/v1/profile-update' // PUT
export const PROFILE_CHANGE_PASSWORD: string = '/v1/change-password' // POST
export const PROFILE_LAST_ACTIVITY: string = '/v1/last-activity' // GET
