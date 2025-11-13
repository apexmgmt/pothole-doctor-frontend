/**
 * Base API URL for backend requests.
 * Uses NEXT_PUBLIC_API_URL from environment variables, or defaults to localhost.
 */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export * from './auth_api'
export * from './company_api'
export * from './permission_api'
export * from './role_api'
export * from './locations_api'
export * from './staff_api'
