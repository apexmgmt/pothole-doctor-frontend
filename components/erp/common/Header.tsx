'use client'

import React from 'react'

import { useSelector } from 'react-redux'

import CustomButton from './CustomButton'
import { BellIcon, SearchIcon } from '@/public/icons'
import { PanelLeftIcon } from 'lucide-react'
import { useSidebar } from './menus/sidebar/sidebarContext'

const Header: React.FC = () => {
  const pageTitle = useSelector((state: any) => state.pageTitle.pageTitle)
  const { sidebarToggle } = useSidebar()

  return (
    <header className='flex items-center justify-between gap-5 px-4 md:px-6 py-2.5 bg-dark text-white border-b border-b-border'>
      <div className='flex items-center gap-2'>
        <CustomButton
          variant='ghost'
          onClick={sidebarToggle}
          className='block xl:hidden p-0! rounded-xl cursor-pointer!'
        >
          <PanelLeftIcon className='h-5 w-5' />
        </CustomButton>
        <div className='flex-1 text-lg md:text-xl font-semibold text-light-2'>{pageTitle}</div>
      </div>
      <div className='flex gap-2 opacity-0 pointer-events-none'>
        <CustomButton icon={<SearchIcon />} variant='outline' className='md:p-2.5! p-1.5! md:rounded-xl rounded-lg' />
        <CustomButton icon={<BellIcon />} variant='outline' className='md:p-2.5! p-1.5! md:rounded-xl rounded-lg' />
      </div>
    </header>
  )
}

export default Header
