import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { EyeOpenIcon, EyeCloseIcon } from '@/public/icons'
import OrganizationService from '@/services/api/organizations.service'

interface SecurityTabProps {
  companyId: string
  onPasswordChanged?: () => void
}

interface SecurityFormValues {
  new_password: string
  password_confirmation: string
}

const SecurityTab: React.FC<SecurityTabProps> = ({ companyId, onPasswordChanged }) => {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<SecurityFormValues>({
    defaultValues: {
      new_password: '',
      password_confirmation: ''
    }
  })

  const newPassword = form.watch('new_password') || ''
  const hasMinLength = newPassword.length >= 8
  const hasLowerAndUpper = /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword)
  const hasNumber = /(?=.*\d)/.test(newPassword)
  const hasSymbol = /(?=.*[@$!%*?&\s])/.test(newPassword)

  const {
    formState: { isSubmitting },
    setError
  } = form

  const onSubmitSecurity = async (values: SecurityFormValues) => {
    try {
      await OrganizationService.changePassword(companyId, {
        password: values.new_password,
        password_confirmation: values.password_confirmation
      })

      toast.success('Password updated successfully')
      form.reset()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const normalizedField = field === 'password' ? 'new_password' : field

          if (normalizedField === 'new_password' || normalizedField === 'password_confirmation') {
            const message = Array.isArray(messages) ? String(messages[0]) : String(messages)

            setError(normalizedField, { type: 'server', message })
          }
        })

        return
      }

      toast.error(error?.message || 'Failed to update password')
    }
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Change Password</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitSecurity)} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    <div className='relative flex items-center'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-3 focus:outline-none text-gray hover:text-light transition-colors cursor-pointer'
                      >
                        {showNewPassword ? <EyeCloseIcon className='h-4 w-4' /> : <EyeOpenIcon className='h-4 w-4' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password_confirmation'
              rules={{
                required: 'Please confirm your password',
                validate: value => value === form.getValues('new_password') || 'Passwords do not match'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirmation Password <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative flex items-center'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 focus:outline-none text-gray hover:text-light transition-colors cursor-pointer'
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
              <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-500' : ''}`}>
                {hasMinLength ? (
                  <Check className='w-4 h-4 text-green-500' />
                ) : (
                  <span className='w-4 text-center'>•</span>
                )}{' '}
                Minimum 8 characters long - the more, the better
              </li>
              <li className={`flex items-center gap-2 ${hasLowerAndUpper ? 'text-green-500' : ''}`}>
                {hasLowerAndUpper ? (
                  <Check className='w-4 h-4 text-green-500' />
                ) : (
                  <span className='w-4 text-center'>•</span>
                )}{' '}
                At least one lowercase & one uppercase character
              </li>
              <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-500' : ''}`}>
                {hasNumber ? <Check className='w-4 h-4 text-green-500' /> : <span className='w-4 text-center'>•</span>}{' '}
                At least one number
              </li>
              <li className={`flex items-center gap-2 ${hasSymbol ? 'text-green-500' : ''}`}>
                {hasSymbol ? <Check className='w-4 h-4 text-green-500' /> : <span className='w-4 text-center'>•</span>}{' '}
                At least one symbol or whitespace character
              </li>
            </ul>
          </div>
          <div className='flex justify-end'>
            <Button
              type='submit'
              variant='outline'
              size='sm'
              disabled={isSubmitting}
              className='py-2.5 px-3 inline-block h-auto leading-none bg-light text-bg hover:text-bg hover:bg-light/90 border-border'
            >
              {isSubmitting ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default SecurityTab
