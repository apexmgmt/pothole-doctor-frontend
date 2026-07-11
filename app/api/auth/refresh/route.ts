import { NextRequest, NextResponse } from 'next/server'

import { API_URL, AUTH_REFRESH_TOKEN, AUTH_REFRESH_TOKEN_TENANT } from '@/constants/api'
import { isTenant, checkSubdomain } from '@/utils/utility'
import { CookieKeys } from '@/constants/cookies'

interface CacheEntry {
  data: any
  timestamp: number
}

const globalForCache = globalThis as unknown as {
  authRefreshCache?: Map<string, CacheEntry>
  authRefreshLock?: Map<string, Promise<any>>
}

const cache = globalForCache.authRefreshCache || new Map<string, CacheEntry>()
const lock = globalForCache.authRefreshLock || new Map<string, Promise<any>>()

if (process.env.NODE_ENV !== 'production') {
  globalForCache.authRefreshCache = cache
  globalForCache.authRefreshLock = lock
}

const CACHE_DURATION = 60000 // 60 seconds

async function refreshFromBackend(refresh_token: string, tenant?: string): Promise<any> {
  const isTenantApi = await isTenant()
  const endpoint = isTenantApi ? AUTH_REFRESH_TOKEN_TENANT : AUTH_REFRESH_TOKEN

  // console.log('[ENDPOINT]: ', endpoint)
  // console.log('[TENANT]: ', tenant)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  if (isTenantApi && tenant) {
    headers['tenant'] = tenant
  }

  console.log('[HEADER]: ', headers)

  // Debugging: Log the refresh token (first 10 and last 10 chars) to see if it changes
  // const tokenPreview =
  //   refresh_token.length > 20
  //     ? `${refresh_token.substring(0, 10)}...${refresh_token.substring(refresh_token.length - 10)}`
  //     : refresh_token

  // console.log(`[REFRESH] Sending token to backend: ${tokenPreview}`)
  // console.log(`[REFRESH] Tenant: ${tenant}`)

  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ refresh_token })
  })

  let data: any

  try {
    data = await res.json()
  } catch {
    data = null
  }

  // console.log(`[REFRESH] Backend status: ${res.status}`)

  if (!res.ok || data?.status !== 'success') {
    const errorPayload = data || { message: 'Failed to refresh token' }

    errorPayload.statusCode = res.status
    throw errorPayload
  }

  return data
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refresh_token } = body
    let tenant = req.cookies.get(CookieKeys.TENANT)?.value

    if (!tenant) {
      const { subdomain } = checkSubdomain(req)

      tenant = subdomain
    }

    if (!refresh_token) {
      return NextResponse.json({ message: 'Refresh token is required' }, { status: 400 })
    }

    const now = Date.now()

    // 1. Return cached resolved data if available
    const cached = cache.get(refresh_token)

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[REFRESH] CACHE HIT`)

      return NextResponse.json(cached.data)
    }

    // 2. If another request is already in-flight, wait for it
    const existing = lock.get(refresh_token)

    if (existing) {
      console.log(`[REFRESH] WAITING for in-flight request`)

      try {
        const data = await existing

        return NextResponse.json(data)
      } catch (error: any) {
        return NextResponse.json(error, { status: error?.statusCode || 400 })
      }
    }

    // 3. No cache, no in-flight — make the actual backend call
    console.log(`[REFRESH] CACHE MISS — calling backend`)

    const promise = refreshFromBackend(refresh_token, tenant)

    // console.log('[DEBUG] Promise defined')

    lock.set(refresh_token, promise)

    try {
      const data = await promise

      // console.log('[DEBUG] Unlocked')

      // Store the resolved data in cache
      cache.set(refresh_token, { data, timestamp: Date.now() })

      // Cleanup old entries
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
          cache.delete(key)
        }
      }

      return NextResponse.json(data)
    } catch (error: any) {
      return NextResponse.json(error, { status: error?.statusCode || 400 })
    } finally {
      lock.delete(refresh_token)
    }
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Something went wrong' }, { status: 500 })
  }
}
