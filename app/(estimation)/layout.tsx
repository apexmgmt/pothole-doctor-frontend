import React from 'react'

import { ReactNode } from '@/types'
import Header from '@/components/frontend/common/Header'
import Footer from '@/components/frontend/common/Footer'
import Link from 'next/link'
import Image from 'next/image'

// Generate meta data

const EstimateLayout = ({ children }: ReactNode) => {
  return (
    <div className='bg-accent z-10 min-h-screen flex justify-center'>
      <div className='max-w-[850px] w-full bg-card px-10! pt-10! '>
        <Link href={'/erp'} className='border-b border-border '>
          <Image src='/images/dashboard/logo.webp' alt='logo' width={145} height={61} className='' />
        </Link>
        <main className='text-primary-foreground mt-4'>{children}</main>
      </div>
    </div>
  )
}

export default EstimateLayout
