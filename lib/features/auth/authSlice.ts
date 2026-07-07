import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'

export interface AuthState {
  user: User | null
  refresh: boolean
}

const initialState: AuthState = {
  user: null, // Hydrated from server
  refresh: true
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUserSuccess: state => {
      state.user = null
    },
    setUserData: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    setRefreshData: (state, action: PayloadAction<boolean>) => {
      state.refresh = action.payload
    }
  }
})

export const { logoutUserSuccess, setUserData, setRefreshData } = authSlice.actions
export default authSlice.reducer
