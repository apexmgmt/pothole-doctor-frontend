import CookieService from '@/services/app/cookie.service'
import { decryptData } from '@/utils/encryption'
import Profile from '@/views/erp/profile'

export const dynamic = 'force-dynamic'

const ProfilePage = async () => {
  const encryptedUser = await CookieService.get('user')
  const userData = encryptedUser ? decryptData(encryptedUser) : null

  return <Profile userData={userData} />
}

export default ProfilePage
