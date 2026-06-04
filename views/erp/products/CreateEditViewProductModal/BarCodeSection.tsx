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
    <Card className='p-4 border border-border rounded-lg space-y-3'>
      <div className='flex items-center gap-2 pb-3.5 mb-3 border-b border-border'>
        <Barcode className='h-4 w-4 text-gray-50' />
        <h4 className='leading-none font-semibold'>Bar Code</h4>
      </div>

      <div className='rounded-md bg-gray-100 p-1 flex items-center justify-center'>
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
