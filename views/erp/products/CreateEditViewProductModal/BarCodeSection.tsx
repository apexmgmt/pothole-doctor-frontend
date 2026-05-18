'use client'

import Image from 'next/image'

import { Barcode } from 'lucide-react'

import { Card } from '@/components/ui/card'

import { generateFileUrl } from '@/utils/utility'

interface BarCodeSectionProps {
  barCodePath?: string | null
}

export function BarCodeSection({ barCodePath }: BarCodeSectionProps) {
  if (!barCodePath) {
    return null
  }

  const barCodeSrc = generateFileUrl(barCodePath) || barCodePath

  return (
    <Card className='p-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <Barcode className='h-4 w-4 text-gray-50' />
        <h4 className='text-sm font-medium'>Bar Code</h4>
      </div>

      <div className='rounded-md border bg-gray-50 p-4 flex items-center justify-center'>
        <Image
          src={barCodeSrc}
          alt='Product bar code'
          width={320}
          height={140}
          unoptimized
          className='h-auto w-full max-w-[320px]'
        />
      </div>
    </Card>
  )
}
