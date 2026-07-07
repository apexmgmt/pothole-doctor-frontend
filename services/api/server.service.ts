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

  let responseData: any
  let rawText = ''

  try {
    rawText = await response.text()
    responseData = rawText ? JSON.parse(rawText) : null
  } catch (e) {
    console.error('Failed to parse JSON response:', rawText)
    responseData = { _rawText: rawText, status: response.status, statusText: response.statusText }
  }

  let isSuccess = response.ok

  if (isSuccess && responseData && typeof responseData === 'object') {
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

  return responseData ?? { success: true }
}
