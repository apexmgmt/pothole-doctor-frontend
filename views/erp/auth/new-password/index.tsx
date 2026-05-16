'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'

import CustomButton from '@/components/erp/common/CustomButton'
import Field from '@/components/erp/common/Field'
import AuthService from '@/services/api/auth.service'
import { decryptData } from '@/utils/encryption'

type ResetRoutePayload = {
  type: string
  email: string
  reset_token: string
}

type ResetPasswordForm = {
  password: string
  password_confirmation: string
}

const NewPassIndex: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apiError, setApiError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      password: '',
      password_confirmation: ''
    }
  })

  useEffect(() => {
    const encryptedData = searchParams.get('data')

    if (!encryptedData) {
      toast.error('Invalid password reset request')
      router.replace('/erp/forgot-password')

      return
    }

    try {
      const decodedData = decodeURIComponent(encryptedData)
      const parsed = decryptData(decodedData) as ResetRoutePayload

      if (!parsed?.email || !parsed?.reset_token || parsed?.type !== 'reset-password') {
        toast.error('Invalid password reset request')
        router.replace('/erp/forgot-password')

        return
      }

      setEmail(parsed.email)
      setResetToken(parsed.reset_token)
    } catch {
      toast.error('Invalid password reset request')
      router.replace('/erp/forgot-password')
    }
  }, [searchParams, router])

  const onSubmit: SubmitHandler<ResetPasswordForm> = async values => {
    if (!email || !resetToken) {
      setApiError('Missing reset credentials. Please try forgot password again.')

      return
    }

    try {
      setApiError(null)
      await AuthService.resetPassword(email, values.password, values.password_confirmation, resetToken)
      toast.success('Password reset successfully')
      router.push('/erp/login')
    } catch (error: any) {
      setApiError(error?.message || 'Failed to reset password')
    }
  }

  return (
    <>
      <h1 className='text-light-2 text-2xl font-semibold mb-1'>Create New Password</h1>
      <p className='text-gray mb-2'>Your new password must be different from previously used password.</p>
      <p className='text-gray mb-6 text-sm'>Reset token is valid for 5 minutes.</p>

      <form className='max-w-md' onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label='Password'
          type='password'
          name='password'
          placeholder='********'
          register={register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
          error={errors.password}
        />
        <Field
          label='Confirm Password'
          type='password'
          name='password_confirmation'
          placeholder='********'
          register={register('password_confirmation', {
            required: 'Confirm password is required',
            validate: value => value === getValues('password') || 'Passwords do not match'
          })}
          error={errors.password_confirmation}
        />

        <div className='mt-4'>
          <CustomButton type='submit' variant='primary' fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </CustomButton>
        </div>

        {apiError && <p className='text-red-500 text-sm mt-3'>{apiError}</p>}
      </form>
    </>
  )
}

export default NewPassIndex
