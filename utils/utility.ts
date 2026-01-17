import { NextRequest } from 'next/server'

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

/**Generate fill url from full path */
export const generateFileUrl = (fullPath: string | null | undefined) => {
  if (!fullPath) return null
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  return apiUrl + fullPath
}

/** Get file extension from full path */
export const getFileExtension = (fullPath: string) => {
  if (!fullPath) return 'unknown'
  const ext = fullPath.split('.').pop()?.toLowerCase() || ''

  return ext
}

/** Get file type from full path */
export const getFileType = (fullPath: string) => {
  const ext = getFileExtension(fullPath)

  const imageExts = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'tiff',
    'heic',
    'avif',
    'jfif',
    'ico',
    'raw',
    'heif'
  ]

  const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv']
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf']

  if (imageExts.includes(ext)) return 'image'
  if (videoExts.includes(ext)) return 'video'
  if (docExts.includes(ext)) return 'document'

  return 'other'
}

/**
 * Check subdomain and domain information from request
 * @param req NextRequest
 * @returns Object with subdomain, domain, isSubdomain, and isApexDomain information
 */
export const checkSubdomain = (req: NextRequest) => {
  const hostname = req.headers.get('host') || req.nextUrl.hostname
  const isProduction = process.env.NODE_ENV === 'production'

  // Remove port from hostname for domain comparison
  const hostnameWithoutPort = hostname.split(':')[0]
  const domainParts = hostnameWithoutPort.split('.')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  // Extract the apex domain from the app URL (remove protocol and port)
  const apexDomain = appUrl.replace(/^https?:\/\//, '').split(':')[0]

  let subdomain = ''
  let domain = hostnameWithoutPort
  let isSubdomain = false
  let isApexDomain = hostnameWithoutPort === apexDomain

  console.log('checkSubdomain - hostname:', hostname)
  console.log('checkSubdomain - hostnameWithoutPort:', hostnameWithoutPort)
  console.log('checkSubdomain - apexDomain:', apexDomain)
  console.log('checkSubdomain - domainParts:', domainParts)

  if (!isApexDomain) {
    // Check if this could be a subdomain of the apex domain
    if (domainParts.length >= 2) {
      const possibleBaseDomain = domainParts.slice(1).join('.')

      console.log('checkSubdomain - possibleBaseDomain:', possibleBaseDomain)

      if (possibleBaseDomain === apexDomain && domainParts[0] !== 'www') {
        // This is a subdomain of the apex domain
        subdomain = domainParts[0]
        domain = possibleBaseDomain
        isSubdomain = true
      } else {
        // This is a custom domain (including www.customdomain.com)
        subdomain = ''
        domain = hostname
        isSubdomain = false
      }
    } else {
      // Single part domain (shouldn't happen in practice, but handle it)
      subdomain = ''
      domain = hostname
      isSubdomain = false
    }
  }

  console.log('checkSubdomain - result:', { subdomain, domain, isSubdomain, isApexDomain })

  return { subdomain, domain, isSubdomain, isApexDomain }
}
