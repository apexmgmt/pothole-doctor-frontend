'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
// TODO: Uncomment when authentication is needed
// import CookieService from '@/services/app/cookie.service'
// import { decryptData } from '@/utils/encryption'
// import AuthService from '@/services/api/auth.service'
import { User } from '@/types'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import GeneralTab from './GeneralTab'
import PermissionsTab from './PermissionsTab'
import SecurityTab from './SecurityTab'
import { GenaralTabIcon, KeyIcon, SecurityIcon } from '@/public/icons'

const Profile: React.FC = () => {
  const dispatch = useAppDispatch()
  // TODO: Uncomment when authentication is needed
  // const reduxUser = useAppSelector(state => state.auth.user) as User | null
  const [activeTab, setActiveTab] = useState<string>('general')
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // TODO: Uncomment when authentication is needed
  // Get user from Redux or cookies
  // const cookieUser: User | null = useMemo(() => {
  //   if (reduxUser) return null
  //   try {
  //     const raw = CookieService.getSync('user')
  //     if (!raw) return null
  //     const decrypted = decryptData(raw)
  //     if (typeof decrypted === 'string') {
  //       return JSON.parse(decrypted) as User
  //     }
  //     return decrypted as User
  //   } catch {
  //     return null
  //   }
  // }, [reduxUser])

  // const effectiveUser = reduxUser || cookieUser

  useEffect(() => {
    dispatch(setPageTitle('Profile'))
  }, [dispatch])

  // TODO: Uncomment when authentication is needed
  // Fetch user details on mount
  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     try {
  //       setIsLoading(true)
  //       const response = await AuthService.getUserDetails()
  //       if (response?.data) {
  //         setUserData(response.data)
  //       } else if (effectiveUser) {
  //         setUserData(effectiveUser)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user details:', error)
  //       if (effectiveUser) {
  //         setUserData(effectiveUser)
  //       }
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchUserDetails()
  // }, [effectiveUser])

  // Mock data for testing (remove when authentication is enabled)
  useEffect(() => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setUserData({
        id: '1',
        name: 'Alex Telles',
        first_name: 'Alex',
        last_name: 'Telles',
        email: 'alextelles22@gmail.com',
        phone: '+1 (312) 555-8742',
        address: '1245 West Madison Street, Chicago, IL, USA',
        profile_picture: '/images/avatar.webp',
        created_at: '2025-05-14T09:32:00Z',
        updated_at: '2025-05-14T10:15:00Z',
        permissions: [
          { id: 1, name: 'Manage Staff' },
          { id: 2, name: 'Create Staff' },
          { id: 3, name: 'View Staff' },
          { id: 4, name: 'Manage Locations' },
          { id: 5, name: 'Delete Records' }
        ],
        roles: [
          {
            id: 1,
            name: 'Admin',
            guard_name: 'web',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            permissions: []
          },
          {
            id: 2,
            name: 'Team Manager',
            guard_name: 'web',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            permissions: []
          }
        ]
      } as User)
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>Loading profile...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'General', icon: GenaralTabIcon },
    { id: 'permissions', label: 'Permissions', icon: KeyIcon },
    { id: 'security', label: 'Security', icon: SecurityIcon }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab userData={userData} />
      case 'permissions':
        return <PermissionsTab userData={userData} />
      case 'security':
        return <SecurityTab />
      default:
        return <GeneralTab userData={userData} />
    }
  }

  return (
    <div className='space-y-5'>
      {/* Profile Header with Banner */}
      <ProfileHeader userData={userData} />

      {/* Tabs Box - Single container for tabs, sidebar, and content */}
      <div className='bg-border/40 rounded-lg border border-border/40 p-6'>
        <div className='flex gap-5'>
          {/* Sidebar Navigation */}
          <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Separator Line */}
          <div className='w-px bg-border/60' />

          {/* Main Content */}
          <main className='flex-1'>{renderTabContent()}</main>
        </div>
      </div>
    </div>
  )
}

export default Profile
