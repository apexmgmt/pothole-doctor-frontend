import React from 'react'

import { ReactNode } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

// Generate meta data

const EstimateLayout = ({ children }: ReactNode) => {
  return (
    <div className='bg-accent print:bg-white z-10 min-h-screen flex justify-center'>
      <div className='max-w-[850px] w-full bg-card print:bg-white px-6 pt-6 sm:px-10! sm:pt-10! print:px-0! print:pt-0! '>
        <Link href={'/erp'} className='border-b border-border '>
          <Image src='/images/dashboard/logo.webp' alt='logo' width={145} height={61} className='' />
        </Link>
        <main className='text-primary-foreground print:text-black my-4'>{children}</main>
      </div>
    </div>
  )
}

export default EstimateLayout
