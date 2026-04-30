'use client'

import React, { useState, useEffect, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import CookieService from '@/services/app/cookie.service'
import { decryptData } from '@/utils/encryption'
import { User } from '@/types'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import GeneralTab from './GeneralTab'
import PermissionsTab from './PermissionsTab'
import SecurityTab from './SecurityTab'
import { GenaralTabIcon, KeyIcon, SecurityIcon } from '@/public/icons'

interface ProfileProps {
  userData?: User | any
}

const Profile: React.FC<ProfileProps> = ({ userData: propUser }) => {
  const dispatch = useAppDispatch()
  const reduxUser = useAppSelector(state => state.auth.user) as User | null
  const [activeTab, setActiveTab] = useState<string>('general')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Get user from Redux, props, or cookies (in priority order)
  const cookieUser: User | null = useMemo(() => {
    if (reduxUser || propUser) return null

    try {
      const raw = CookieService.getSync('user')

      if (!raw) return null
      const decrypted = decryptData(raw)

      if (typeof decrypted === 'string') {
        return JSON.parse(decrypted) as User
      }

      return decrypted as User
    } catch {
      return null
    }
  }, [reduxUser, propUser])

  // Priority: Redux user > Prop user > Cookie user
  const userData = reduxUser || propUser || cookieUser

  useEffect(() => {
    dispatch(setPageTitle('Profile'))
  }, [dispatch])

  if (!userData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No user data available</p>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'General', icon: GenaralTabIcon },
    { id: 'security', label: 'Security', icon: SecurityIcon }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab userData={userData} />
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
      <div className='bg-border/40 rounded-lg border border-border/40  px-4 py-5 md:p-6'>
        <div className='flex gap-5 flex-col lg:flex-row'>
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
