'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import CookieService from '@/services/storage/cookie.service'
import { decryptData } from '@/utils/encryption'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { logoutUserSuccess } from '@/lib/features/auth/authSlice'
import AuthService from '@/services/api/auth.service'

interface FallbackUser {
  id?: string
  name?: string
  email?: string
  first_name?: string
  last_name?: string
  profile_picture?: string | null
  userable?: {
    profile_picture?: string | null
    [k: string]: unknown
  }
  [k: string]: unknown
}

interface SidebarFooterProps {
  user?: FallbackUser
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ user: propUser }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const reduxUser = useAppSelector(state => state.auth.user) as FallbackUser | null
  const [open, setOpen] = useState(false)

  const cookieUser: FallbackUser | null = useMemo(() => {
    if (reduxUser || propUser) return null
    const raw = CookieService.get('user')
    if (!raw) return null
    try {
      const decrypted = decryptData(raw)
      if (typeof decrypted === 'string') {
        return JSON.parse(decrypted) as FallbackUser
      }
      return decrypted as FallbackUser
    } catch {
      return null
    }
  }, [reduxUser, propUser])

  const effectiveUser = reduxUser || propUser || cookieUser || {}

  const firstName = effectiveUser.first_name || ''
  const lastName = effectiveUser.last_name || ''
  const fullName = effectiveUser.name || [firstName, lastName].filter(Boolean).join(' ') || 'User'

  const email = effectiveUser.email || '---'
  const avatar = effectiveUser.profile_picture || effectiveUser.userable?.profile_picture || '/images/avatar.webp'

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  const handleProfile = () => {
    setOpen(false)
    router.push('/erp/profile')
  }

  const handleLogout = async () => {
    setOpen(false)
    await AuthService.logout()
    router.push('/login')
  }

  return (
    <div className='border-t border-border p-4 space-y-4'>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center gap-3 p-3 rounded-lg bg-bg/30 cursor-pointer hover:bg-bg/50 transition-colors'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={avatar} alt={fullName} />
              <AvatarFallback className='bg-border text-light text-xs font-medium'>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-light font-medium text-sm truncate'>{fullName}</p>
              <p className='text-gray text-xs truncate'>{email}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56 bg-bg/90'>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile} className='cursor-pointer'>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className='cursor-pointer text-red-600'>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default SidebarFooter
