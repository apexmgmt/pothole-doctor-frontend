import React from 'react'
import Image from 'next/image'

const SidebarFooter: React.FC = () => {
  return (
    <div className='border-t border-border p-4 space-y-4'>
      {/* User Profile */}
      <div className='flex items-center gap-3 p-3 rounded-lg bg-bg/30'>
        <div className='w-10 h-10 rounded-full relative'>
          <Image src='/images/dashboard/user.webp' alt='profile' fill className='object-cover !relative' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-light font-medium text-sm truncate'>Liam Harper</p>
          <p className='text-gray text-xs truncate'>patrikhgy@gmail.com</p>
        </div>
        <button className='p-1 text-gray hover:text-light transition-colors'>
          {/* <EllipsisVerticalIcon className="w-4 h-4" /> */}
        </button>
      </div>
    </div>
  )
}

export default SidebarFooter
