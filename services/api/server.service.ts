'use server'

import apiInterceptor from './api.interceptor'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  revalidateTags?: string[]
}

export const executeServerRequest = async (
  slug: string,
  options: RequestOptions = {},
  mode: 'normal' | 'raw' = 'normal',
  formData?: FormData
) => {
  const { revalidateTags = [], ...fetchOptions } = options

  if (formData) {
    fetchOptions.body = formData
  }

  const response = await apiInterceptor(slug, fetchOptions)

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let responseData: any
  let rawText = ''

  if (!isJson && response.ok) {
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    responseData = {
      __isBlob: true,
      base64: buffer.toString('base64'),
      contentType
    }
  } else {
    try {
      rawText = await response.text()
      responseData = rawText ? JSON.parse(rawText) : null
    } catch (e) {
      console.error('Failed to parse JSON response:', rawText)
      responseData = { _rawText: rawText, status: response.status, statusText: response.statusText }
    }
  }

  let isSuccess = response.ok

  if (isSuccess && responseData && typeof responseData === 'object' && !responseData.__isBlob) {
    if (responseData.success === false || responseData.status === 'error' || responseData.status === 'fail') {
      isSuccess = false
    }
  }

  if (!isSuccess) {
    return {
      __isServerError: true,
      responseData,
      mode,
      status: response.status,
      statusText: response.statusText
    }
  }

  if (revalidateTags.length > 0) {
    const { revalidate } = await import('@/services/app/cache.service')

    await Promise.all(revalidateTags.map(tag => revalidate(tag)))
  }

  return responseData ?? { success: true }
}
