'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import ChangePasswordSection from './ChangePasswordSection'

interface SecurityTabProps {
  // Add any props if needed in the future
}

const SecurityTab: React.FC<SecurityTabProps> = () => {
  return (
    <div className='space-y-5'>
      {/* Change Password Section */}
      <ChangePasswordSection />

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
