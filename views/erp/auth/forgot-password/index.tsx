'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'

import Field from '@/components/erp/common/Field'
import CustomButton from '@/components/erp/common/CustomButton'
import AuthService from '@/services/api/auth.service'
import { encryptData } from '@/utils/encryption'

type ForgotPasswordForm = {
  email: string
}

const ForgotPassword: React.FC = () => {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' }
  })

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async values => {
    try {
      setApiError(null)
      await AuthService.forgotPassword(values.email)

      const encrypted = encryptData({
        type: 'forgot-password',
        email: values.email
      })

      toast.success('OTP sent successfully')
      router.push(`/erp/verify-otp?data=${encodeURIComponent(encrypted)}`)
    } catch (error: any) {
      setApiError(error?.message || 'Failed to send OTP')
    }
  }

  return (
    <>
      <h1 className='text-light-2 text-xl md:text-2xl font-semibold mb-2.5'>Forgot Password</h1>
      <p className='text-sm text-gray mb-6'>Lost your password? Please enter your email address.</p>

      <form className='max-w-md' onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label='Email'
          type='text'
          name='email'
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
              message: 'Invalid email address'
            }
          })}
          placeholder='email@example.com'
          error={errors.email}
        />
        <div className='mt-4'>
          <CustomButton type='submit' variant='primary' fullWidth className='!py-2' disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Reset Password'}
          </CustomButton>
        </div>
        <div className='mt-3'>
          <Link href='/erp/login'>
            <CustomButton type='button' variant='secondary' fullWidth className='!py-2'>
              Login
            </CustomButton>
          </Link>
        </div>
        {apiError && <p className='text-red-500 text-sm mt-3'>{apiError}</p>}
      </form>
    </>
  )
}

export default ForgotPassword
