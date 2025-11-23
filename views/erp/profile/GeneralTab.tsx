'use client'

import React from 'react'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { User } from '@/types'
import { formatDate, getUserDisplayData } from './utils'

interface GeneralTabProps {
  userData: User | null
}

const GeneralTab: React.FC<GeneralTabProps> = ({ userData }) => {
  const { firstName, lastName, email, phone, address } = getUserDisplayData(userData)

  return (
    <div className='space-y-5'>
      {/* Header with Edit Button */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Personal Information</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Profile Information'
          link='/erp/profile/edit'
          variant='text'
          buttonSize='default'
          buttonVariant='outline'
        />
      </div>

      {/* Personal Information Fields - Two Column Layout */}
      <div className='grid grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-5'>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>First Name</label>
            <p className='text-light'>{firstName || 'N/A'}</p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Last Name</label>
            <p className='text-light'>{lastName || 'N/A'}</p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Email</label>
            <p className='text-light'>{email}</p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Phone</label>
            <p className='text-light'>{phone}</p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Address</label>
            <p className='text-light'>{address}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-5'>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Created</label>
            <p className='text-light text-sm'>{formatDate(userData?.created_at)}</p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Last Update</label>
            <p className='text-light text-sm'>{formatDate(userData?.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
