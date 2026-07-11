import { executeServerRequest } from './server.service'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  revalidateTags?: string[]
}

export const handleRequest = async <T = any>(
  slug: string,
  options: RequestOptions = {},
  mode: 'normal' | 'raw' = 'normal',
  formData?: FormData
): Promise<T> => {
  try {
    let result: any
    const actualFormData = formData || (options.body instanceof FormData ? options.body : undefined)

    if (actualFormData) {
      const { requiresAuth = true, ...fetchOptions } = options

      const { getAuthTokens } = await import('@/app/actions/auth')

      const headers: Record<string, string> = {
        ...((fetchOptions.headers as Record<string, string>) || {})
      }

      const { accessToken, tenant } = await getAuthTokens()

      if (requiresAuth && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      if (tenant) {
        headers['tenant'] = tenant
      }

      // Let browser set Content-Type with boundary for FormData
      if (headers['Content-Type']) {
        delete headers['Content-Type']
      }

      const response = await fetch(slug, {
        ...fetchOptions,
        headers,
        body: actualFormData
      })

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      if (!isJson && response.ok) {
        result = {
          blob: async () => await response.blob()
        }
      } else {
        const responseData = isJson ? await response.json() : await response.text()
        let isSuccess = response.ok

        if (isSuccess && responseData && typeof responseData === 'object') {
          if (responseData.success === false || responseData.status === 'error' || responseData.status === 'fail') {
            isSuccess = false
          }
        }

        if (!isSuccess) {
          result = {
            __isServerError: true,
            responseData,
            mode,
            status: response.status,
            statusText: response.statusText
          }
        } else {
          if (options.revalidateTags?.length) {
            const { revalidate } = await import('@/services/app/cache.service')

            await Promise.all(options.revalidateTags.map(tag => revalidate(tag)))
          }

          result = responseData ?? { success: true }
        }
      }
    } else {
      result = await executeServerRequest(slug, options, mode, actualFormData)
    }

    if (result && typeof result === 'object' && result.__isBlob) {
      return {
        blob: async () => {
          if (typeof window !== 'undefined') {
            const binaryString = atob(result.base64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)

            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }

            return new Blob([bytes], { type: result.contentType })
          } else {
            return new Blob([Buffer.from(result.base64, 'base64')], { type: result.contentType })
          }
        }
      } as any
    }

    if (result && typeof result === 'object' && result.__isServerError) {
      const { responseData, mode: errorMode } = result

      if (errorMode === 'raw') {
        const parsed = responseData
        let errorMsg = parsed?.message || parsed?.error

        if (!errorMsg) {
          if (result.status === 404) errorMsg = 'Resource not found.'
          else if (result.status === 400) errorMsg = 'Bad request.'
          else if (result.status === 401) errorMsg = 'Unauthorized.'
          else if (result.status === 403) errorMsg = 'Forbidden.'
          else if (result.status === 422) errorMsg = 'Validation failed.'
          else if (result.status === 500) errorMsg = 'Internal server error.'
          else errorMsg = result.statusText || 'An error occurred.'
        }

        const cleanError = new Error(errorMsg)

        ;(cleanError as any).status = parsed?.status || result.status
        ;(cleanError as any).data = parsed?.data
        ;(cleanError as any).success = parsed?.success
        ;(cleanError as any).originalResponse = parsed
        ;(cleanError as any).errors = parsed?.errors

        throw cleanError
      }

      let fallbackMsg = responseData?.message || responseData?.error

      if (!fallbackMsg) {
        if (result.status === 404) fallbackMsg = 'Resource not found.'
        else if (result.status === 400) fallbackMsg = 'Bad request.'
        else if (result.status === 401) fallbackMsg = 'Unauthorized.'
        else if (result.status === 403) fallbackMsg = 'Forbidden.'
        else if (result.status === 422) fallbackMsg = 'Validation failed.'
        else if (result.status === 500) fallbackMsg = 'Internal server error.'
        else fallbackMsg = result.statusText || 'Something went wrong!'
      }

      throw new Error(fallbackMsg)
    }

    return result as T
  } catch (error: any) {
    // Intercept Next.js redirect errors thrown from Server Actions
    const isRedirect =
      error?.message === 'NEXT_REDIRECT' ||
      (error?.digest && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))

    if (isRedirect && typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/erp/login'
      }, 1500)

      throw new Error('Session expired. Redirecting to login...')
    }

    if (mode === 'raw') {
      let cleanError: Error | null = null

      try {
        // If it's a serialized JSON Error (from Server Action boundary)
        if (error?.message && typeof error.message === 'string' && error.message.trim().startsWith('{')) {
          const parsed = JSON.parse(error.message)

          // Construct a clean Error containing the parsed message
          let msg = parsed?.message || parsed?.error || error.message || 'An error occurred'

          if (msg.includes('An error occurred in the Server Components render')) {
            msg = 'Something went wrong! Please try again later.'
          }

          cleanError = new Error(msg)

          // Attach raw properties to the error object so client code can access them
          ;(cleanError as any).status = parsed?.status
          ;(cleanError as any).data = parsed?.data
          ;(cleanError as any).success = parsed?.success
          ;(cleanError as any).originalResponse = parsed
          ;(cleanError as any).errors = parsed?.errors
        }
      } catch (parseError) {
        // Fall back to original error if JSON parsing fails
      }

      if (cleanError) {
        if (cleanError.message.includes('An error occurred in the Server Components render')) {
          cleanError.message = 'Something went wrong! Please try again later.'
        }

        throw cleanError
      }
    }

    if (error?.message?.includes('An error occurred in the Server Components render')) {
      error.message = 'Something went wrong! Please try again later.'
    }

    throw error
  }
}
