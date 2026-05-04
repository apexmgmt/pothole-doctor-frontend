'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Loader2 } from 'lucide-react'

import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AuthService from '@/services/api/auth.service'
import { LoginActivities, LoginActivity } from '@/types'

const LoginActivitySection = () => {
  const [activities, setActivities] = useState<LoginActivities | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null)

  const fetchActivities = async () => {
    setIsLoading(true)

    try {
      const response = await AuthService.getActivity()

      setActivities(response.data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch login activities')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleLogoutAllDevices = async () => {
    setIsLoading(true)

    try {
      await AuthService.logoutAllDevices()
      toast.success('Logged out from all devices successfully')
      fetchActivities()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to logout from all devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    setEndingSessionId(sessionId)

    try {
      await AuthService.endSession(sessionId)
      toast.success('Session ended successfully')
      fetchActivities()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to end session')
    } finally {
      setEndingSessionId(null)
    }
  }

  const getLocationText = (activity: LoginActivity) => {
    // You can parse location from IP or user_agent if available
    return 'Location not available'
  }

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const renderActivityCard = (activity: LoginActivity, isCurrent = false, index?: number) => (
    <div key={activity.login_at + index} className='bg-bg-3 rounded-lg border border-border p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-medium text-light'>
          {isCurrent ? 'Current Session' : `Other active session ${index !== undefined ? `#${index + 1}` : ''}`}
        </h4>
        {!isCurrent && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleEndSession(activity.login_at)}
            disabled={endingSessionId === activity.login_at}
            className='text-primary hover:text-primary'
          >
            {endingSessionId === activity.login_at ? (
              <>
                <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                Ending...
              </>
            ) : (
              'End'
            )}
          </Button>
        )}
      </div>

      <div className='space-y-3 min-[450px]:space-y-2 text-sm'>
        <div className='flex flex-col min-[450px]:flex-row items-start gap-1 min-[450px]:gap-3'>
          <span className='text-gray w-32'>Last accessed:</span>
          <Badge variant='default' className='bg-light text-bg capitalize'>
            {getTimeAgo(activity.login_at)}
          </Badge>
        </div>

        <div className='flex flex-col min-[450px]:flex-row items-start gap-1 min-[450px]:gap-3'>
          <span className='text-gray w-32'>Location:</span>
          <div className='flex-1 flex flex-wrap items-center gap-2'>
            <span className='text-light'>{getLocationText(activity)}</span>
            <span className='text-gray text-xs'>(Approximate location)</span>
          </div>
        </div>

        <div className='flex flex-col min-[450px]:flex-row items-start gap-1 min-[450px]:gap-3'>
          <span className='text-gray w-32'>Platform:</span>
          <span className='text-light'>
            {activity.browser} on {activity.platform} {activity.platform_version}
          </span>
        </div>

        <div className='flex flex-col min-[450px]:flex-row items-start gap-1 min-[450px]:gap-3'>
          <span className='text-gray w-32'>IP Address:</span>
          <span className='text-light'>{activity.ip_address}</span>
        </div>

        {activity.device_type && (
          <div className='flex flex-col min-[450px]:flex-row items-start gap-1 min-[450px]:gap-3'>
            <span className='text-gray w-32'>Device Type:</span>
            <div className='flex items-center gap-2'>
              {/* <Badge variant='outline'>{activity.device_type}</Badge> */}
              {activity.is_mobile && <Badge variant='outline'>Mobile</Badge>}
              {activity.is_tablet && <Badge variant='outline'>Tablet</Badge>}
              {activity.is_desktop && <Badge variant='outline'>Desktop</Badge>}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className='space-y-5 pt-6 border-t border-border'>
      <div>
        <div className='flex flex-row items-center justify-between flex-wrap space-y-0 pb-4 gap-2.5'>
          <div className='text-lg font-semibold text-light'>Login Devices</div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleLogoutAllDevices}
            disabled={isLoading}
            className='py-2.5 px-3 h-auto bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                Loading...
              </>
            ) : (
              'Logout from all devices'
            )}
          </Button>
        </div>

        <div className='relative space-y-4'>
          {isLoading && !activities ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray' />
            </div>
          ) : (
            <>
              <p className='text-sm text-gray'>
                The locations listed below are an estimate of where the IP address may be located within your country,
                region and city. The accuracy of the look-up varies by providers and the location of the device. This
                should only be used as a rough guideline.
              </p>

              {activities && (
                <>
                  <p className='text-sm text-light font-medium'>
                    You're signed in to {activities.previous_activity ? activities.previous_activity.length + 1 : 1}{' '}
                    session
                    {activities.previous_activity && activities.previous_activity.length > 0 ? 's' : ''}
                  </p>

                  {/* Current Session */}
                  {activities.current_activity && renderActivityCard(activities.current_activity, true)}

                  {/* Other Sessions */}
                  {activities.previous_activity &&
                    activities.previous_activity.map((activity, index) => renderActivityCard(activity, false, index))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginActivitySection
