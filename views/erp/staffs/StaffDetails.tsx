'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { appUrl } from '@/utils/utility'
import EditButton from '@/components/erp/common/buttons/EditButton'
import StaffService from '@/services/api/staff.service'

interface StaffDetailsProps {
  staffData: any
  setStaffData: (options: any) => void
  fetchData?: () => void
}

const StaffDetails: React.FC<StaffDetailsProps> = ({ staffData, setStaffData, fetchData }) => {
  const fetchStaffDetails = async () => {
    StaffService.show(staffData?.id)
      .then(response => {
        setStaffData(response.data)
        if (fetchData) {
          fetchData()
        }
      })
      .catch(error => {
        console.error('Error fetching staff details:', error)
      })
  }

  if (!staffData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No staff selected</p>
      </div>
    )
  }

  const fullName = `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim()
  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-light mt-2'>Staff Details</h3>
        <div className='mt-2'>
          <EditButton
            title='Edit'
            tooltip='Edit Staff Information'
            link={`/erp/staffs/${staffData.id}/edit`}
            variant='text'
            buttonSize='default'
            buttonVariant='outline'
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className='flex items-center space-x-4 p-4 bg-bg-3 rounded-lg'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={staffData.userable?.profile_picture} alt={fullName} />
          <AvatarFallback className='text-lg font-semibold'>{initials || 'C'}</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h4 className='text-lg font-medium text-light'>{fullName}</h4>
          <p className='text-gray'>{staffData.email}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Personal Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Personal Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>First Name</label>
              <p className='text-light'>{staffData.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Last Name</label>
              <p className='text-light'>{staffData.last_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Email</label>
              <p className='text-light'>{staffData.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Phone</label>
              <p className='text-light'>{staffData.userable?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Address</label>
              <p className='text-light'>{staffData.userable?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Permission Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Permission Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Roles</label>
              {staffData?.roles && staffData?.roles.length > 0 ? (
                <div className='flex flex-wrap gap-2 mt-1'>
                  {staffData.roles.map((role: any) => (
                    <Badge key={role.id} className='px-2 py-1 rounded-md'>
                      {role.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-light'>N/A</p>
              )}
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Permissions</label>
              {staffData?.permissions && staffData?.permissions.length > 0 ? (
                <div className='flex flex-wrap gap-2 mt-1'>
                  {staffData.permissions.map((permission: any) => (
                    <Badge key={permission.id} className='px-2 py-1 rounded-md'>
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-light'>N/A</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-gray uppercase'>Created At</label>
            <p className='text-light text-sm'>
              {staffData.created_at ? new Date(staffData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase'>Updated At</label>
            <p className='text-light text-sm'>
              {staffData.updated_at ? new Date(staffData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDetails
