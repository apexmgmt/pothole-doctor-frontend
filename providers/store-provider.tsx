'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store'
import { setUserData } from '@/lib/features/auth/authSlice'
import { User } from '@/types'

export default function StoreProvider({
  children,
  user
}: {
  children: React.ReactNode
  user?: User
}) {
  const storeRef = useRef<AppStore>(null)
  
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()

    // Dispatch initial state
    if (user) {
      storeRef.current.dispatch(setUserData(user))
    }
    
    // We can also dispatch access token and permissions to store if they exist in authSlice
    // But since the current authSlice might only have `setUserData`, we use what's available
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
