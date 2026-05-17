import LocationService from '@/services/api/locations/location.service'
import CookieService from '@/services/app/cookie.service'
import { CountryWithStates } from '@/types'
import { decryptData } from '@/utils/encryption'
import Profile from '@/views/erp/profile'

export const dynamic = 'force-dynamic'

const ProfilePage = async () => {
  const encryptedUser = await CookieService.get('user')
  const userData = encryptedUser ? decryptData(encryptedUser) : null
  let countryWithStates: CountryWithStates[] = []

  if (userData?.user_type === 'contractor' || userData?.user_type === 'referral') {
    const response = await LocationService.index()

    countryWithStates = response.data ?? []
  }

  return <Profile userData={userData} countryWithStates={countryWithStates} />
}

export default ProfilePage
