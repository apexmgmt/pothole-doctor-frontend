/**
 * Generates an API URL with the subdomain (if any) from the current request host.
 *
 * Uses NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL from environment variables.
 * Determines subdomain by comparing the current host to the main app domain.
 * If a subdomain exists, it is prepended to the API base URL's host (e.g., test.localhost:8000).
 *
 * Works both on server-side (using next/headers) and client-side (using window.location).
 *
 * @returns Promise<string> The API URL with the subdomain if present
 */
export async function getApiUrl(): Promise<string> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  // Check environment
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server-side logic
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host') || ''
    return buildUrl(apiBaseUrl, appBaseUrl, host)
  } else {
    // Client-side logic
    const host = window.location.host
    return buildUrl(apiBaseUrl, appBaseUrl, host)
  }
}

/**
 * Generates an app URL with an optional subdomain.
 *
 * Uses NEXT_PUBLIC_APP_URL from environment variables.
 * If a subdomain is provided, it is prepended to the app base URL's host (e.g., abc.localhost:3000).
 *
 * @param subdomain - The subdomain to prepend (optional)
 * @returns string The app URL with the subdomain if provided
 */
export function appUrl(subdomain?: string): string {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  if (!subdomain || subdomain.trim() === '') {
    return appBaseUrl
  }

  try {
    const appUrl = new URL(appBaseUrl)
    appUrl.hostname = `${subdomain}.${appUrl.hostname}`
    return appUrl.toString()
  } catch {
    return appBaseUrl
  }
}

/**
 * Helper to build the API URL with subdomain if present.
 */
function buildUrl(apiBaseUrl: string, appBaseUrl: string, host: string): string {
  try {
    const baseDomain = new URL(appBaseUrl).hostname
    const hostWithoutPort = host.split(':')[0]

    if (hostWithoutPort === baseDomain) {
      return apiBaseUrl + '/api'
    }

    const hostParts = hostWithoutPort.split('.')
    const baseParts = baseDomain.split('.')

    if (hostParts.length > baseParts.length) {
      const subdomain = hostParts.slice(0, hostParts.length - baseParts.length).join('.')
      const api = new URL(apiBaseUrl)
      api.hostname = `${subdomain}.${api.hostname}`
      return api.toString() + 'api'
    }

    return apiBaseUrl + '/api'
  } catch {
    return apiBaseUrl + '/api'
  }
}

// Initialize filterOptions from URL params
export const getInitialFilters = (searchParams: URLSearchParams) => {
  const filters: any = {}
  searchParams.forEach((value, key) => {
    // Convert numeric values
    if (key === 'page' || key === 'per_page') {
      filters[key] = parseInt(value)
    } else {
      filters[key] = value
    }
  })

  return filters
}

// Update URL when filters change
export const updateURL = (router: any, filters: any) => {

  const params = new URLSearchParams()

  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.set(key, String(filters[key]))
    }
  })

  const queryString = params.toString()
  const newUrl = queryString ? `?${queryString}` : window.location.pathname

  router.push(newUrl, { scroll: false })
}
