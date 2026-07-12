import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center px-4 bg-white'>
      <div className='text-center max-w-lg'>
        <h1 className='text-8xl md:text-9xl font-bold text-gray-200 tracking-widest relative'>
          4<span className='text-primary'>0</span>4
        </h1>

        <h2 className='text-2xl md:text-3xl font-extrabold text-title mt-8 uppercase'>
          Oops...Page Not Found
        </h2>

        <p className='text-gray-500 mt-4 mb-8 text-sm md:text-base'>
          Sorry for the inconvenience. Please go back to our homepage or check out our services.
        </p>

        <Link
          href='/'
          className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded hover:bg-primary/90 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          BACK TO HOMEPAGE
        </Link>
      </div>
    </div>
  )
}
