import { decryptData } from '@/utils/encryption'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import CookieService from '@/services/app/cookie.service'

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

// Use sync cookie APIs in reducers/initial state (reducers can't be async)
// Return null on server to avoid SSR crashes
const getUserFromCookie = (): User | null => {
  try {
    // If running on server, skip
    if (typeof window === 'undefined') return null

    const userCookie = CookieService.getSync('user')
    if (!userCookie) return null

    const decrypted = decryptData(userCookie)

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

    return decrypted as User
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading user cookie', error)
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
      // remove cookie on logout (client only)
      try {
        CookieService.deleteSync('user')
      } catch {
        /* noop */
      }
    },
    setUserData: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      try {
        // store as JSON string; encryption/decryption handled elsewhere
        CookieService.storeSync('user', JSON.stringify(action.payload), {
          expires: 7,
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
