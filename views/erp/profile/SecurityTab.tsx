'use client'

import React from 'react'

import ChangePasswordSection from './ChangePasswordSection'
import LoginActivitySection from './LoginActivitySection'

interface SecurityTabProps {

  // Add any props if needed in the future
}

const SecurityTab: React.FC<SecurityTabProps> = () => {
  return (
    <div className='space-y-5'>
      {/* Change Password Section */}
      <ChangePasswordSection />
      {/* Two-step verification Section */}
      {/* <div className='space-y-5 pt-6 border-t border-border'>
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
      </div> */}
      {/* Login Activity Section */}
      <LoginActivitySection />
    </div>
  )
}

export default SecurityTab
