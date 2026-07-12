'use client'

import React from 'react'
import { AlertTriangle, ArrowLeft, Globe } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '/'

export default function InvalidSubdomain() {
  return (
    <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4'>
      <div className='w-full max-w-lg text-center space-y-8'>
        {/* Icon */}
        <div className='flex justify-center'>
          <div className='relative'>
            <div className='w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='w-12 h-12 text-destructive' />
            </div>
            <div className='absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-[#0a0a0a] flex items-center justify-center'>
              <Globe className='w-4 h-4 text-muted-foreground' />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className='space-y-3'>
          <h1 className='text-3xl font-bold text-white tracking-tight'>Invalid Subdomain</h1>
          <p className='text-muted-foreground text-base max-w-sm mx-auto leading-relaxed'>
            The subdomain you are trying to access does not exist or is no longer available. Please check the URL and
            try again.
          </p>
        </div>

        {/* Action */}
        <div>
          <a
            href={APP_URL}
            className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm
                       hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30'
          >
            <ArrowLeft className='w-4 h-4' />
            Go to Main Site
          </a>
        </div>

        {/* Subtle footer */}
        <p className='text-xs text-muted-foreground/50'>If you believe this is an error, please contact support.</p>
      </div>
    </div>
  )
}
