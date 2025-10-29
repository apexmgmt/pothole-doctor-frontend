/**
 * Base API URL for backend requests.
 * Uses NEXT_PUBLIC_API_URL from environment variables, or defaults to localhost.
 */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * OAuth2 Endpoints for Laravel Passport
 *
 * These constants represent the main endpoints used for OAuth2 authentication flows.
 * Reference: Laravel Passport routes
 */

// Authorization endpoints
/** GET|HEAD: Start OAuth2 authorization code flow */
export const OAUTH_AUTHORIZE: string = '/oauth/authorize'
/** POST: Approve OAuth2 authorization request */
export const OAUTH_AUTHORIZE_APPROVE: string = '/oauth/authorize'
/** DELETE: Deny OAuth2 authorization request */
export const OAUTH_AUTHORIZE_DENY: string = '/oauth/authorize'

// Device authorization endpoints
/** GET|HEAD: Get device user code */
export const OAUTH_DEVICE: string = '/oauth/device'
/** GET|HEAD: Start device authorization flow */
export const OAUTH_DEVICE_AUTHORIZE: string = '/oauth/device/authorize'
/** POST: Approve device authorization request */
export const OAUTH_DEVICE_AUTHORIZE_APPROVE: string = '/oauth/device/authorize'
/** DELETE: Deny device authorization request */
export const OAUTH_DEVICE_AUTHORIZE_DENY: string = '/oauth/device/authorize'
/** POST: Request device code */
export const OAUTH_DEVICE_CODE: string = '/oauth/device/code'

// Token endpoints
/** POST: Issue OAuth2 access token */
export const OAUTH_TOKEN: string = '/oauth/token'
/** POST: Refresh OAuth2 access token */
export const OAUTH_TOKEN_REFRESH: string = '/oauth/token/refresh'

export const AUTH_LOGIN: string = '/login'
