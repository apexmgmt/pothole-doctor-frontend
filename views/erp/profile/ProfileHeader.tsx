'use client'

import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/types'
import Image from 'next/image'
import { toast } from 'sonner'
import AuthService from '@/services/api/auth.service'
import { Loader2 } from 'lucide-react'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'
import { generateFileUrl } from '@/utils/utility'

interface ProfileHeaderProps {
  userData: User | null
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
  const dispatch = useAppDispatch()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstName = userData?.first_name || ''
  const lastName = userData?.last_name || ''
  const fullName = userData?.name || [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const email = userData?.email || '---'
  const profilePicture = userData?.profile_picture
    ? generateFileUrl(userData?.profile_picture)
    : userData?.userable?.profile_picture
      ? generateFileUrl(userData?.userable?.profile_picture)
      : '/images/avatar.webp'

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      AuthService.updateProfilePicture(formData)
        .then(response => {
          const updatedUser = {
            ...userData,
            userable: {
              ...(userData?.userable || {}),
              profile_picture: response.data.profile_picture
            }
          } as User

          dispatch(setUserData(updatedUser))

          toast.success('Profile picture updated successfully')
          setIsUploading(false)
        })
        .catch(error => {
          toast.error(error.message)
          setIsUploading(false)
          console.log(error)
        })

      // Reset input
      e.target.value = ''
    } catch (error: any) {
      toast.error('Something went wrong while updating profile picture!')
      setIsUploading(false)
    }
  }

  return (
    <div className='relative bg-border/40 rounded-lg border border-border/40 overflow-hidden'>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
        disabled={isUploading}
      />

      {/* Banner with background pattern */}
      <div className='h-48 relative z-10 '>
        <div
          className='absolute inset-x-2 top-2 bottom-0 z-10 rounded-sm overflow-hidden'
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.05) 10px,
            rgba(255, 255, 255, 0.05) 20px
          )`
          }}
        >
          <Image src='/images/dashboard/profile-cover.webp' fill alt='' className='object-cover' />
        </div>
        {/* Gradient overlay for depth */}
        <div className='absolute inset-x-2 top-2 bottom-0  bg-gradient-to-br from-border/30 via-border/15 to-border/8' />

        {/* Profile Picture centered over banner */}
        <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10'>
          <div className='relative'>
            <Avatar
              className='h-[86px] w-[86px] border border-light shadow-lg cursor-pointer hover:opacity-80 transition-opacity'
              onClick={handleAvatarClick}
            >
              <AvatarImage src={profilePicture} alt={fullName} />
              <AvatarFallback className='bg-accent text-accent-foreground text-2xl font-semibold'>
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full'>
                <Loader2 className='h-6 w-6 animate-spin text-white' />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name and Email below banner */}
      <div className='pt-[60px] pb-5 px-5 text-center'>
        <h2 className='text-base font-semibold text-light-2 mb-2'>{fullName}</h2>
        <p className='text-gray text-sm'>{email}</p>
      </div>
    </div>
  )
}

export default ProfileHeader
