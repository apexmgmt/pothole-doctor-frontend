'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import OrganizationService from '@/services/api/organizations.service'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileTabs from '@/views/erp/profile/ProfileTabs'
import { GeneralTabIcon, SecurityIcon } from '@/public/icons'
import GeneralTab from './GeneralTab'
import { Organization } from '@/types'
import SecurityTab from './SecurityTab'

interface OrganizationDetailsProps {
  companyId: string | null
  onCompanyUpdated?: (updatedCompany: Organization) => void
  impersonateUser?: (userId: string) => Promise<void>
  isImpersonating?: boolean
  onStatusToggle?: (companyId: string) => Promise<void>
  statusLoading?: boolean
}

const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({
  companyId,
  onCompanyUpdated,
  impersonateUser,
  isImpersonating = false,
  onStatusToggle,
  statusLoading = false
}) => {
  const [companyData, setCompanyData] = useState<any>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('general')

  const fetchOrganizationDetails = async () => {
    if (!companyId) {
      setCompanyData(null)

      return
    }

    setIsLoadingCompany(true)

    OrganizationService.show(companyId)
      .then(response => {
        setCompanyData(response.data)
      })
      .catch(error => {
        console.error('Error fetching company details:', error)
      })
      .finally(() => {
        setIsLoadingCompany(false)
      })
  }

  useEffect(() => {
    fetchOrganizationDetails()
  }, [companyId])

  if (!companyId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No company selected</p>
      </div>
    )
  }

  if (isLoadingCompany) {
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
              <Skeleton className='h-12 w-36 ml-auto' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No company selected</p>
      </div>
    )
  }

  const fullName = `${companyData.first_name || ''} ${companyData.last_name || ''}`.trim()

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
              <AvatarImage src={companyData.userable?.profile_picture || ''} alt={fullName} />
              <AvatarFallback className='bg-accent text-accent-foreground text-2xl font-semibold'>
                {initials || 'C'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className='pt-[60px] pb-5 px-5 text-center'>
          <h2 className='text-base font-semibold text-light-2 mb-2'>{fullName || 'Company'}</h2>
          <p className='text-gray text-sm'>{companyData.email || 'N/A'}</p>
        </div>
      </div>

      <div className='bg-border/40 rounded-lg border border-border/40 px-4 py-5 md:p-6'>
        <div className='flex gap-5 flex-col lg:flex-row'>
          <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className='w-px bg-border/60' />

          <main className='flex-1'>
            {activeTab === 'security' ? (
              <SecurityTab companyId={String(companyData.id)} onPasswordChanged={fetchOrganizationDetails} />
            ) : (
              <GeneralTab
                companyData={companyData}
                onCompanyUpdated={(updatedCompany: Organization) => {
                  setCompanyData(updatedCompany)
                  onCompanyUpdated?.(updatedCompany)
                }}
                impersonateUser={impersonateUser}
                isImpersonating={isImpersonating}
                onStatusToggle={onStatusToggle}
                statusLoading={statusLoading}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default OrganizationDetails
