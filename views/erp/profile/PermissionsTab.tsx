'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { User } from '@/types'

interface PermissionsTabProps {
  userData: User | null
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({ userData }) => {
  return (
    <div className='space-y-5'>
      {/* Header with Edit Button */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Permission Information</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Permissions'
          link='/erp/profile/edit'
          variant='text'
          buttonSize='default'
          buttonVariant='outline'
        />
      </div>

      {/* Roles Section */}
      {userData?.roles && userData.roles.length > 0 && (
        <div className='space-y-5'>
          <div>
            <label className='text-xs text-gray uppercase block mb-2'>Roles</label>
            <div className='flex flex-wrap gap-2'>
              {userData.roles.map((role: any) => (
                <Badge
                  key={role.id || role}
                  variant='secondary'
                  className='p-2.5 rounded-md bg-light hover:bg-light-2 text-bg border border-border'
                >
                  {role.name || role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Permissions Section */}
      <div className='space-y-5'>
        <div>
          <label className='text-xs text-gray uppercase block mb-2'>Permissions</label>
          {userData?.permissions && userData.permissions.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {userData.permissions.map((permission: any) => (
                <Badge
                  key={permission.id || permission}
                  variant='secondary'
                  className='p-2.5 rounded-md bg-light hover:bg-light-2 text-bg border border-border'
                >
                  {permission.name || permission}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-light'>N/A</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PermissionsTab
