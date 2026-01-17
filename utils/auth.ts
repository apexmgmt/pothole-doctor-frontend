import CookieService from '@/services/app/cookie.service'
import { User } from '@/types'
import { decryptData } from './encryption'

export const getAuthUser = async (): Promise<User | null> => {
  const encryptedUser = await CookieService.get('user')

  if (!encryptedUser) return null

  try {
    const decryptedUser = decryptData(encryptedUser)
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
