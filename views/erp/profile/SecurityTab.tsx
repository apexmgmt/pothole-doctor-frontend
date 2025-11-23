'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EyeOpenIcon, EyeCloseIcon } from '@/public/icons'
import EditButton from '@/components/erp/common/buttons/EditButton'

interface SecurityTabProps {
  // Add any props if needed in the future
}

const SecurityTab: React.FC<SecurityTabProps> = () => {
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className='space-y-5'>
      {/* Change Password Section */}
      <div className='space-y-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-light'>Change Password</h3>
          <EditButton
            title='Edit'
            tooltip='Edit Password'
            link='/erp/profile/edit'
            variant='text'
            buttonSize='default'
            buttonVariant='outline'
          />
        </div>

        {/* Password Fields in One Row */}
        <div className='grid grid-cols-3 gap-4'>
          {/* Current Password */}
          <div className='space-y-2'>
            <Label htmlFor='current-password' className='text-sm text-light'>
              Current Password
            </Label>
            <div className='relative'>
              <Input
                id='current-password'
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className='pr-10 bg-transparent border-border text-light placeholder:text-gray'
                placeholder='Enter current password'
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
              >
                {showCurrentPassword ? <EyeCloseIcon className='h-4 w-4' /> : <EyeOpenIcon className='h-4 w-4' />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className='space-y-2'>
            <Label htmlFor='new-password' className='text-sm text-light'>
              New Password
            </Label>
            <div className='relative'>
              <Input
                id='new-password'
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className='pr-10 bg-transparent border-border text-light placeholder:text-gray'
                placeholder='Enter new password'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
              >
                {showNewPassword ? <EyeCloseIcon className='h-4 w-4' /> : <EyeOpenIcon className='h-4 w-4' />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className='space-y-2'>
            <Label htmlFor='confirm-password' className='text-sm text-light'>
              Confirm Password
            </Label>
            <div className='relative'>
              <Input
                id='confirm-password'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='pr-10 bg-transparent border-border text-light placeholder:text-gray'
                placeholder='Confirm new password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
              >
                {showConfirmPassword ? <EyeCloseIcon className='h-4 w-4' /> : <EyeOpenIcon className='h-4 w-4' />}
              </button>
            </div>
          </div>
        </div>

        {/* Password Requirements */}
        <div className='mt-6'>
          <h4 className='text-sm font-medium text-light mb-3'>Password Requirements</h4>
          <ul className='space-y-2 text-sm text-gray'>
            <li>• Minimum 8 characters long - the more, the better</li>
            <li>• At least one lowercase & one uppercase character</li>
            <li>• At least one number</li>
            <li>• At least one symbol or whitespace character</li>
          </ul>
        </div>

        {/* Change Password Button */}
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            className='py-2.5 px-3 inline-block h-auto leading-[1] bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-step verification Section */}
      <div className='space-y-5 pt-6 border-t border-border'>
        <div>
          <h3 className='text-lg font-semibold text-light mb-2'>Two-step verification</h3>
          <p className='text-sm text-gray mb-4'>Keep your account secure with authentication step.</p>
          <div className='mb-4'>
            <p className='text-sm text-light'>Two Step authentication is disabled</p>
          </div>
          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              className='py-2.5 px-3 inline-block h-auto leading-[1] bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
            >
              Enable
            </Button>
          </div>
          <p className='text-sm text-gray mt-4'>
            Two step authentication adds an additional layer of security to your account by requiring an OTP after
            login.
          </p>
        </div>
      </div>

      {/* Login Devices Section */}
      <div className='space-y-5 pt-6 border-t border-border'>
        <div>
          <h3 className='text-lg font-semibold text-light mb-2'>Login Devices</h3>
          <p className='text-sm text-gray mb-4'>
            The locations listed below are estimates based on IP addresses and should be used as a rough guideline.
          </p>
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-light'>You're signed in to 1 sessions</p>
            <Button
              variant='outline'
              size='sm'
              className='py-2.5 px-3 inline-block h-auto leading-[1] bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
            >
              Log Out From All Devices
            </Button>
          </div>

          {/* Current Session */}
          <div className='bg-bg-3 rounded-lg border border-border p-4 space-y-3'>
            <h4 className='text-sm font-medium text-light'>Current Session</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-gray'>Last accessed:</span>
                <span className='px-2 py-1 rounded-full bg-light text-bg text-xs'>12 seconds ago</span>
              </div>
              <div>
                <span className='text-gray'>Location: </span>
                <span className='text-light'>1245 West Madison Street, Chicago, IL, USA</span>
              </div>
              <div>
                <span className='text-gray'>Platform: </span>
                <span className='text-light'>0 on 0 0</span>
              </div>
              <div>
                <span className='text-gray'>IP Address: </span>
                <span className='text-light'>103.234.118.254</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityTab
