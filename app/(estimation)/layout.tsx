import React from 'react'

import { ReactNode } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

// Generate meta data

const EstimateLayout = ({ children }: ReactNode) => {
  return (
    <div className='bg-white z-10 min-h-screen flex justify-center'>
      <div
        id='invoice-capture-root'
        className='max-w-[850px] w-full bg-white px-6 pt-6 sm:px-10! sm:pt-10! print:px-0! print:pt-0! '
      >
        <Link href={'/erp'} className='border-b border-[#e5e7eb]'>
          <Image src='/images/dashboard/logo.webp' alt='logo' width={145} height={61} className='' />
        </Link>
        <main className='text-black my-4'>{children}</main>
      </div>
    </div>
  )
}

export default EstimateLayout
