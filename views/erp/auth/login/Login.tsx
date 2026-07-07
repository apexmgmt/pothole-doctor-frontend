'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import Field from '@/components/erp/common/Field'
import CustomButton from '@/components/erp/common/CustomButton'
import AuthService from '@/services/api/auth.service'
import { setAllAuthCookies, generateRedirectUrl } from '@/app/actions/auth'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'
import Link from 'next/link'
import { decryptRedirectUrl } from '@/utils/encryption'

type LoginForm = {
  email: string
  password: string
}

const Login: React.FC<{ isTenant: boolean }> = ({ isTenant }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit: SubmitHandler<LoginForm> = async data => {
    try {
      setIsLoading(true)
      AuthService.login(data.email, data.password)
        .then(async response => {
          if (!isTenant && response?.data?.is_redirect_required && response?.data?.domain) {
            // ... (keep redirect logic)
            const authData = {
              access_token: response?.data.access_token,
              refresh_token: response?.data.refresh_token,
              token_type: response?.data.token_type,
              expires_in: response?.data.expires_in,
              user: response?.data?.user,
              roles: response?.data?.roles || [],
              permissions: response?.data?.permissions || []
            }

            const redirectUrl = await generateRedirectUrl(authData, response.data.domain ?? '')

            window.location.href = redirectUrl
          } else {
            await setAllAuthCookies(
              response?.data.access_token,
              response?.data.refresh_token,
              response?.data.token_type,
              response?.data.expires_in,
              response?.data?.roles || [],
              response?.data?.permissions || [],
              response?.data?.user
            )

            dispatch(setUserData(response?.data?.user))

            // Redirect to the original route or default to /erp/
            let redirect = '/erp/'
            const redirectParam = searchParams.get('redirect')

            if (redirectParam) {
              const decryptedRedirect = await decryptRedirectUrl(redirectParam)

              redirect = decryptedRedirect || redirectParam
            }

            router.push(redirect)
          }
        })
        .catch(error => {
          setIsLoading(false)
          setError(error?.message || 'Login failed. Please try again.')
        })
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h1 className='text-light-2 text-2xl font-semibold mb-1'>Welcome to Pothole Doctors!</h1>
      <p className='text-gray mb-6'>Sign in to your account to begin.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label='Email'
          type='text'
          name='email'
          placeholder='Enter email'
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
              message: 'Invalid email address'
            }
          })}
          error={errors.email}
        />
        <Field
          label='Password'
          type='password'
          name='password'
          placeholder='Enter password'
          register={register('password', { required: 'Password is required' })}
          error={errors.password}
        />

        {/* Forgot Password */}
        <Link
          href='/erp/forgot-password'
          className='flex items-center gap-1 text-sm text-gray-400 hover:text-gray-100 mt-2'
        >
          Forgot Password?
        </Link>
        <div className='mt-4'>
          <CustomButton type='submit' variant='primary' fullWidth className='py-2!' disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </CustomButton>
        </div>
        {error && <p className='text-red-500 text-sm mt-4'>{error}</p>}
      </form>
    </>
  )
}

export default Login
