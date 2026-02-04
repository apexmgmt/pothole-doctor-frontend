'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AuthService from '@/services/api/auth.service'
import { ProfileChangePasswordPayload } from '@/types'
import { EyeOpenIcon, EyeCloseIcon } from '@/public/icons'
import CookieService from '@/services/app/cookie.service'
import { useAppDispatch } from '@/lib/hooks'
import { logoutUserSuccess } from '@/lib/features/auth/authSlice'

interface FormValues {
  current_password: string
  new_password: string
  confirm_password: string
}

const ChangePasswordSection = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: ProfileChangePasswordPayload = {
      current_password: values.current_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password
    }

    try {
      await AuthService.updatePassword(payload)
      toast.success('Password updated successfully')
      form.reset()
      CookieService.delete('access_token')
      CookieService.delete('refresh_token')
      CookieService.delete('token_type')
      CookieService.delete('user')
      dispatch(logoutUserSuccess())
      router.push('/login')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Change Password</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Password Fields in One Row */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Current Password */}
            <FormField
              control={form.control}
              name='current_password'
              rules={{ required: 'Current password is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Current Password <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Enter current password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
                      >
                        {showCurrentPassword ? (
                          <EyeCloseIcon className='h-4 w-4' />
                        ) : (
                          <EyeOpenIcon className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name='new_password'
              rules={{
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\s])[A-Za-z\d@$!%*?&\s]{8,}$/,
                  message: 'Password must meet all requirements'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Password <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
                      >
                        {showNewPassword ? <EyeCloseIcon className='h-4 w-4' /> : <EyeOpenIcon className='h-4 w-4' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name='confirm_password'
              rules={{
                required: 'Please confirm your password',
                validate: value => value === form.getValues('new_password') || 'Passwords do not match'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-light transition-colors'
                      >
                        {showConfirmPassword ? (
                          <EyeCloseIcon className='h-4 w-4' />
                        ) : (
                          <EyeOpenIcon className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              type='submit'
              variant='outline'
              size='sm'
              disabled={isLoading}
              className='py-2.5 px-3 inline-block h-auto leading-[1] bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
            >
              {isLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ChangePasswordSection
