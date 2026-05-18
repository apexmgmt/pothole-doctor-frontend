'use client'

import Image from 'next/image'

import { QrCode } from 'lucide-react'

import { Card } from '@/components/ui/card'

import { generateFileUrl } from '@/utils/utility'

interface QrCodeSectionProps {
  qrCodePath?: string | null
}

export function QrCodeSection({ qrCodePath }: QrCodeSectionProps) {
  if (!qrCodePath) {
    return null
  }

  const qrCodeSrc = generateFileUrl(qrCodePath) || qrCodePath

  return (
    <Card className='p-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <QrCode className='h-4 w-4 text-gray-50' />
        <h4 className='text-sm font-medium'>QR Code</h4>
      </div>

      <div className='rounded-md border bg-gray-50 p-0 flex items-center justify-center'>
        <Image
          src={qrCodeSrc}
          alt='Product QR code'
          width={220}
          height={220}
          unoptimized
          className='h-auto w-full max-w-[220px]'
        />
      </div>
    </Card>
  )
}
