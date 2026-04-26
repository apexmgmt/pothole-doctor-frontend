'use client'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CompletionCertificate } from '@/types'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const CompletionCertificatesModal = ({
  open,
  onOpenChange,
  workOrderNumber,
  certificates
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderNumber?: number | string | null
  certificates: CompletionCertificate[]
}) => {
  return (
    <>
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Completion Certificate — WO #${workOrderNumber?.toString().padStart(6, '0') ?? 'N/A'}`}
        description={`${certificates.length} certificate${certificates.length !== 1 ? 's' : ''} found for this work order`}
        maxWidth='sm'
        disableClose={false}
        actions={
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        }
      >
        {certificates.length === 0 ? (
          <div className='flex items-center justify-center h-32 text-zinc-400 text-sm'>
            No completion certificates found.
          </div>
        ) : (
          <div className='space-y-3'>
            {certificates.map((cert, idx) => (
              <Link
                key={cert.id ?? idx}
                href={`/completion-certificate?wo_id=${cert?.wo_id}&sg_id=${cert?.sg_id}&st_id=${cert?.st_id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='block'
              >
                <Card className='bg-accent border-border w-full hover:bg-accent-hover transition-colors'>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-semibold text-zinc-100'>{cert.service_type_name}</span>
                          <Badge variant={cert.is_completed ? 'success' : 'warning'} className='capitalize text-xs'>
                            {cert.is_completed ? (
                              <>
                                <CheckCircleIcon className='h-3 w-3 mr-1 inline-block' />
                                Completed
                              </>
                            ) : (
                              <>
                                <XCircleIcon className='h-3 w-3 mr-1 inline-block' />
                                Incomplete
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CommonDialog>
    </>
  )
}

export default CompletionCertificatesModal
