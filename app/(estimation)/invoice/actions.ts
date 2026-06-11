'use server'

export async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    // Handle relative URLs by prefixing the app URL
    let fetchUrl = url

    if (url.startsWith('/')) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      fetchUrl = `${appUrl}${url}`
    }

    const response = await fetch(fetchUrl)

    if (!response.ok) return null

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image for PDF:', error)

    return null
  }
}
