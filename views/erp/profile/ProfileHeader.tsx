'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/types'
import Image from 'next/image'

interface ProfileHeaderProps {
  userData: User | null
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
  const firstName = userData?.first_name || ''
  const lastName = userData?.last_name || ''
  const fullName = userData?.name || [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const email = userData?.email || '---'
  const profilePicture = userData?.profile_picture || userData?.userable?.profile_picture || '/images/avatar.webp'

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className='relative bg-border/40 rounded-lg border border-border/40 overflow-hidden'>
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
          <Avatar className='h-[86px] w-[86px] border border-light shadow-lg'>
            {/* <AvatarImage src={profilePicture} alt={fullName} /> */}
            {/* Testing scenario */}
            <AvatarImage src='/images/dashboard/profile-pic.webp' alt={fullName} />
            <AvatarFallback className='bg-accent text-accent-foreground text-2xl font-semibold'>
              {initials || 'U'}
            </AvatarFallback>
          </Avatar>
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
