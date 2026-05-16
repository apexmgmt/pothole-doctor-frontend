'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import CustomButton from '@/components/erp/common/CustomButton'
import AuthService from '@/services/api/auth.service'
import { decryptData, encryptData } from '@/utils/encryption'

type OtpRoutePayload = {
  type: string
  email: string
}

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

const OTPIndex: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [email, setEmail] = useState('')

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const encryptedData = searchParams.get('data')

    if (!encryptedData) {
      toast.error('Invalid verification request')
      router.replace('/erp/forgot-password')

      return
    }

    try {
      const decodedData = decodeURIComponent(encryptedData)
      const parsed = decryptData(decodedData) as OtpRoutePayload

      if (!parsed?.email || parsed?.type !== 'forgot-password') {
        toast.error('Invalid verification request')
        router.replace('/erp/forgot-password')

        return
      }

      setEmail(parsed.email)
    } catch {
      toast.error('Invalid verification request')
      router.replace('/erp/forgot-password')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = window.setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [resendCooldown])

  const setAt = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, '').slice(-1)

    setOtpDigits(prev => prev.map((digit, i) => (i === index ? value : digit)))

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (index: number, pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '')

    if (!digits) return

    setOtpDigits(prev => {
      const next = [...prev]

      for (let offset = 0; offset < digits.length && index + offset < OTP_LENGTH; offset += 1) {
        next[index + offset] = digits[offset]
      }

      return next
    })

    const nextFocusIndex = Math.min(index + digits.length, OTP_LENGTH) - 1

    if (nextFocusIndex >= 0) {
      inputRefs.current[nextFocusIndex]?.focus()
    }
  }

  const handleSubmit = async () => {
    const otp = otpDigits.join('')

    if (!email) {
      toast.error('Missing email in verification request')

      return
    }

    if (otp.length !== OTP_LENGTH) {
      toast.error('Please enter the 6 digit OTP')

      return
    }

    try {
      setIsSubmitting(true)
      const response = await AuthService.verifyForgotPasswordOtp(email, otp)
      const resetToken = response?.data?.reset_token

      if (!resetToken) {
        toast.error('Reset token was not returned')

        return
      }

      const encrypted = encryptData({
        type: 'reset-password',
        email,
        reset_token: resetToken
      })

      toast.success('OTP verified successfully')
      router.push(`/erp/reset-password?data=${encodeURIComponent(encrypted)}`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to verify OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return

    try {
      setIsResending(true)
      await AuthService.forgotPassword(email)
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      toast.success('OTP resent successfully')
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <h1 className='text-light-2 text-2xl font-semibold mb-1'>Verify Your Email</h1>
      <p className='text-gray mb-2'>We have sent a 6 digit OTP to {email || 'your email'}.</p>
      <p className='text-gray mb-6 text-sm'>The OTP is valid for 5 minutes.</p>

      <div className='w-full mb-4'>
        <div className='grid grid-cols-6 gap-2 w-full'>
          {otpDigits.map((value, index) => (
            <div className='flex-1' key={index}>
              <input
                ref={el => {
                  inputRefs.current[index] = el
                }}
                value={value}
                inputMode='numeric'
                maxLength={1}
                onChange={event => setAt(index, event.target.value)}
                onPaste={event => {
                  event.preventDefault()
                  handlePaste(index, event.clipboardData.getData('text'))
                }}
                onKeyDown={event => {
                  if (event.key === 'Backspace' && !event.currentTarget.value && index > 0) {
                    inputRefs.current[index - 1]?.focus()
                  }
                }}
                className='w-full h-12 text-center text-light bg-bg-2 border border-border rounded-lg text-xl outline-none'
              />
            </div>
          ))}
        </div>
      </div>

      <CustomButton
        type='button'
        variant='primary'
        fullWidth
        className='!py-2'
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Verifying...' : 'Confirm'}
      </CustomButton>

      <CustomButton
        type='button'
        variant='secondary'
        fullWidth
        className='whitespace-nowrap mt-2'
        onClick={handleResend}
        disabled={resendCooldown > 0 || isResending}
      >
        {isResending ? 'Resending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
      </CustomButton>
      <Link
        href='/erp/login'
        prefetch={true}
        className='flex justify-center items-center gap-1 text-sm text-gray-400 hover:text-gray-100 mt-2'
      >
        Back to Login
      </Link>
    </>
  )
}

export default OTPIndex
