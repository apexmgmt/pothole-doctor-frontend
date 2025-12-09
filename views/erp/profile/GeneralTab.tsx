'use client'

import React from 'react'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { User } from '@/types'
import { formatDate } from './utils'

interface GeneralTabProps {
  userData: User | null
}

const GeneralTab: React.FC<GeneralTabProps> = ({ userData }) => {
  return (
    <div className='space-y-5'>
      {/* Header with Edit Button */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Personal Information</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Profile Information'
          link='/erp/profile/edit'
          variant='icon'
          buttonSize='default'
          buttonVariant='ghost'
        />
      </div>

      {/* Personal Information Fields - Two Column Layout */}
      <div>
        {/* Left Column */}
        <div className='space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-xs text-gray uppercase block mb-2'>First Name</label>
              <p className='text-light'>{userData?.first_name || ''}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase block mb-2'>Last Name</label>
              <p className='text-light'>{userData?.last_name || ''}</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-xs text-gray uppercase block mb-2'>Email</label>
              <p className='text-light'>{userData?.email || ' - '}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase block mb-2'>Phone</label>
              <p className='text-light'>{userData?.userable?.phone || ' - '}</p>
            </div>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Address</label>
            <p className='text-light'>{userData?.userable?.address || ' - '}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
