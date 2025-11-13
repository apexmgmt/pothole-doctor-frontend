'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Field from '@/components/erp/common/Field'
import CustomButton from '@/components/erp/common/CustomButton'
import AuthService from '@/services/api/auth.service'
import CookieService from '@/services/app/cookie.service'
import { encryptData } from '@/utils/encryption'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'

type LoginForm = {
  email: string
  password: string
}

const Login: React.FC = () => {
  const router = useRouter()
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
          setIsLoading(false)
          console.log(response)
          // save the token and refresh token
          CookieService.store('access_token', response?.data.access_token, { expires: response?.data.expires_in })
          CookieService.store('refresh_token', response?.data.refresh_token)
          CookieService.store('token_type', response?.data.token_type)
          CookieService.store('user', JSON.stringify(encryptData(response?.data?.user)))
          dispatch(setUserData(response?.data?.user))
          // redirect to dashboard
          router.push('/erp/')
        })
        .catch(error => {
          setIsLoading(false)
          setError(error?.message || 'Login failed. Please try again.')
          CookieService.clear()
        })
    } catch (error) {
      setIsLoading(false)
      // Handle error here (e.g., show error message)
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
          <CustomButton type='submit' variant='primary' fullWidth className='!py-2' disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </CustomButton>
        </div>
        {error && <p className='text-red-500 text-sm mt-4'>{error}</p>}
      </form>
    </>
  )
}

export default Login
