import { decryptData } from '@/utils/encryption'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import CookieService from '@/services/storage/cookie.service'

export interface User {
  id?: string
  email?: string
  name?: string
  role?: string
  [key: string]: unknown
}

export interface AuthState {
  user: User | null
  refresh: boolean
}

const getUserFromCookie = (): User | null => {
  const userCookie = CookieService.get('user')
  if (!userCookie) return null

  try {
    const decrypted = decryptData(userCookie)

    // In development decryptData may return the raw object or a JSON string.
    if (process.env.NODE_ENV === 'development') {
      if (typeof decrypted === 'string') {
        try {
          return JSON.parse(decrypted) as User
        } catch {
          return decrypted as unknown as User
        }
      }
      return decrypted as User
    }

    // In production decryptData should return the parsed object
    return decrypted as User
  } catch (error) {
    // keep short/log for debugging
    // eslint-disable-next-line no-console
    console.error('Error decrypting user cookie', error)
    return null
  }
}

const initialState: AuthState = {
  user: getUserFromCookie(),
  refresh: true
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUserSuccess: state => {
      state.user = null
      // remove cookie on logout
      CookieService.delete('user')
    },
    setUserData: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      try {
        // store as JSON string; encryption/decryption handled elsewhere
        CookieService.store('user', JSON.stringify(action.payload), {
          expires: 7, // optional: cookie expires in 7 days
          path: '/'
        })
      } catch {
        // eslint-disable-next-line no-console
        console.error('Failed to set user cookie')
      }
    },
    setRefreshData: (state, action: PayloadAction<boolean>) => {
      state.refresh = action.payload
    }
  }
})

export const { logoutUserSuccess, setUserData, setRefreshData } = authSlice.actions
export default authSlice.reducer
