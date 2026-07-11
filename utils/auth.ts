import CookieService from '@/services/app/cookie.service'
import { User } from '@/types'
import { decryptData } from './encryption'
import { CookieKeys } from '@/constants/cookies'

export const getAuthUser = async (): Promise<User | null> => {
  const encryptedUser = await CookieService.get(CookieKeys.USER)

  if (!encryptedUser) return null

  try {
    const decryptedUser = await decryptData(encryptedUser)
    let user: User | null = null

    if (process.env.NODE_ENV === 'development') {
      user = typeof decryptedUser === 'string' ? (JSON.parse(decryptedUser) as User) : (decryptedUser as User)
    } else {
      user = decryptedUser as User
    }

    return user
  } catch (error) {
    return null
  }
}
