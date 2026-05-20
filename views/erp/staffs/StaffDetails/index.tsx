'use client'

import React, { useState } from 'react'
import Image from 'next/image'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileTabs from '@/views/erp/profile/ProfileTabs'
import { GeneralTabIcon, SecurityIcon } from '@/public/icons'
import { Staff } from '@/types'
import { generateFileUrl } from '@/utils/utility'
import GeneralTab from './GeneralTab'
import SecurityTab from './SecurityTab'

interface StaffDetailsProps {
  staffData: Staff | null
  setStaffData: (options: Staff | null) => void
  fetchData?: () => void
  canEditStaff?: boolean
}

const StaffDetails: React.FC<StaffDetailsProps> = ({ staffData, setStaffData, fetchData, canEditStaff }) => {
  const [activeTab, setActiveTab] = useState<string>('general')

  if (!staffData) {
    return (
      <div className='space-y-5'>
        <div className='relative bg-border/40 rounded-lg border border-border/40 overflow-hidden'>
          <div className='h-48 relative z-10'>
            <Skeleton className='absolute inset-x-2 top-2 bottom-0 rounded-sm' />
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10'>
              <Skeleton className='h-[86px] w-[86px] rounded-full border border-light/20' />
            </div>
          </div>
          <div className='pt-[60px] pb-5 px-5 text-center space-y-2'>
            <Skeleton className='h-5 w-48 mx-auto' />
            <Skeleton className='h-4 w-60 mx-auto' />
          </div>
        </div>

        <div className='bg-border/40 rounded-lg border border-border/40 px-4 py-5 md:p-6'>
          <div className='flex gap-5 flex-col lg:flex-row'>
            <div className='w-full lg:w-64 shrink-0 space-y-2'>
              <Skeleton className='h-9 w-full' />
              <Skeleton className='h-9 w-full' />
            </div>
            <div className='w-px bg-border/60' />
            <div className='flex-1 space-y-5'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const fullName = `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim()

  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  const tabs = [
    { id: 'general', label: 'General', icon: GeneralTabIcon },
    { id: 'security', label: 'Security', icon: SecurityIcon }
  ]

  return (
    <div className='space-y-5'>
      <div className='relative bg-border/40 rounded-lg border border-border/40 overflow-hidden'>
        <div className='h-48 relative z-10'>
          <div
            className='absolute inset-x-2 top-2 bottom-0 z-10 rounded-sm overflow-hidden'
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.05) 10px,
                rgba(255, 255, 255, 0.05) 20px
              )`
            }}
          >
            <Image src='/images/dashboard/profile-cover.webp' fill alt='' className='object-cover' />
          </div>
          <div className='absolute inset-x-2 top-2 bottom-0 bg-linear-to-br from-border/30 via-border/15 to-border/8' />

          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10'>
            <Avatar className='h-[86px] w-[86px] border border-light shadow-lg'>
              <AvatarImage src={generateFileUrl(staffData.userable?.profile_picture) || ''} alt={fullName} />
              <AvatarFallback className='bg-accent text-accent-foreground text-2xl font-semibold'>
                {initials || 'S'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className='pt-[60px] pb-5 px-5 text-center'>
          <h2 className='text-base font-semibold text-light-2 mb-2'>{fullName || 'Staff'}</h2>
          <p className='text-gray text-sm'>{staffData.email || 'N/A'}</p>
        </div>
      </div>

      <div className='bg-border/40 rounded-lg border border-border/40 px-4 py-5 md:p-6'>
        <div className='flex gap-5 flex-col lg:flex-row'>
          <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className='w-px bg-border/60' />

          <main className='flex-1'>
            {activeTab === 'security' ? (
              <SecurityTab staffId={String(staffData.id)} canEditStaff={canEditStaff} />
            ) : (
              <GeneralTab
                staffData={staffData}
                canEditStaff={canEditStaff}
                onStaffUpdated={updatedStaff => setStaffData(updatedStaff)}
                fetchData={fetchData}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffDetails
