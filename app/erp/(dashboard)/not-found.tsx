import React from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='flex-1 flex items-center justify-center min-h-[calc(100vh-100px)] p-6'>
      <div className='max-w-md w-full bg-card border border-border rounded-xl shadow-sm p-8 text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center'>
            <AlertCircle className='w-10 h-10 text-muted-foreground' />
          </div>
        </div>
        
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold text-card-foreground'>404</h1>
          <h2 className='text-xl font-semibold text-card-foreground'>Page Not Found</h2>
          <p className='text-muted-foreground text-sm'>
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className='pt-4'>
          <Link
            href='/erp'
            className='inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
