'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import Field from '@/components/erp/common/Field'
import CustomButton from '@/components/erp/common/CustomButton'
import AuthService from '@/services/api/auth.service'
import CookieService from '@/services/app/cookie.service'
import { encryptData } from '@/utils/encryption'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'
import { appUrl } from '@/utils/utility'

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
        .then(response => {
          if (!isTenant && response?.data?.is_redirect_required && response?.data?.domain) {
            // If not tenant and redirect is required, redirect to the specified domain (subdomain)
            const authData = {
              access_token: response?.data.access_token,
              refresh_token: response?.data.refresh_token,
              token_type: response?.data.token_type,
              expires_in: response?.data.expires_in,
              user: response?.data?.user,
              roles: response?.data?.roles || [],
              permissions: response?.data?.permissions || []
            }

            const encryptedData = encryptData(authData)
            const redirectUrl = `${appUrl(response.data.domain ?? '')}/erp/redirecting?data=${encodeURIComponent(encryptedData)}`

            window.location.href = redirectUrl
          } else {
            // Save the token and refresh token
            CookieService.storeSync('access_token', response?.data.access_token, { expires: response?.data.expires_in })
            CookieService.storeSync('refresh_token', response?.data.refresh_token)
            CookieService.storeSync('token_type', response?.data.token_type)
            CookieService.storeSync('user', encryptData(response?.data?.user))
            CookieService.storeSync('roles', encryptData(response?.data?.roles || []))

            // Split permissions into chunks to avoid cookie size limit
            const encryptedPermissions = encryptData(response?.data?.permissions || [])
            const chunkSize = Math.ceil(encryptedPermissions.length / 3)

            const chunk1 = encryptedPermissions.slice(0, chunkSize)
            const chunk2 = encryptedPermissions.slice(chunkSize, chunkSize * 2)
            const chunk3 = encryptedPermissions.slice(chunkSize * 2)

            CookieService.storeSync('permissions_1', chunk1)
            CookieService.storeSync('permissions_2', chunk2)
            CookieService.storeSync('permissions_3', chunk3)

            dispatch(setUserData(response?.data?.user))

            // Redirect to the original route or default to /erp/
            const redirect = searchParams.get('redirect') || '/erp/'

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Field
          label='Email'
          type='email'
          name='email'
          placeholder='Enter email'
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
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
