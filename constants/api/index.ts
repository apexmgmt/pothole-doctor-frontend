/**
 * Base API URL for backend requests.
 * Uses NEXT_PUBLIC_API_URL from environment variables, or defaults to localhost.
 */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export * from './auth_api'
