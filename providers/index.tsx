import { cookies } from 'next/headers'
import StoreProvider from './store-provider'
import { CookieKeys } from '@/constants/cookies'
import { decryptUserData } from '@/utils/encryption'
import AuthService from '@/services/api/auth.service'

export default async function Providers({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get(CookieKeys.ACCESS_TOKEN)?.value
  const refreshToken = cookieStore.get(CookieKeys.REFRESH_TOKEN)?.value
  const userCookie = cookieStore.get(CookieKeys.USER)?.value

  let user = null

  if (userCookie) {
    user = await decryptUserData(userCookie)
  }

  // If we have a token but no user data (or we want to ensure it's fresh)
  if ((accessToken || refreshToken) && !user) {
    try {
      // getAuthDetails uses the server-side proxy handleRequest now
      const res = await AuthService.getAuthDetails()

      user = res?.data
    } catch (error) {
      console.error('Failed to fetch user data on server mount', error)
    }
  }

  return <StoreProvider user={user}>{children}</StoreProvider>
}
