'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Client } from '@/types'
import { formatDate } from '@/utils/date'
import { CalendarDays, Mail, MapPin, Phone, PencilIcon, UserRound, ChartBarIcon, Clock } from 'lucide-react'

interface ClientDetailsContentProps {
  clientData: Client
  canEditClient: boolean
  handleEditClient: () => void
}

const ClientDetailsContent: React.FC<ClientDetailsContentProps> = ({ clientData, canEditClient, handleEditClient }) => {
  const fullName = `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim()

  const displayAddress = clientData?.address?.street_address
    ? `${clientData.address.street_address}, ${clientData.address.city?.name || ''}, ${clientData.address.state?.name || ''} ${clientData.address.zip_code || ''}`.trim()
    : 'N/A'

  const displaySalesRep =
    clientData?.reference?.first_name && clientData?.reference?.last_name
      ? `${clientData.reference.first_name} ${clientData.reference.last_name}`
      : 'N/A'

  const displayDate = formatDate(clientData?.created_at) || 'N/A'

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2'>
      <div className='p-2 space-y-4'>
        <div className='space-y-3'>
          {/* Header */}
          <div className='flex items-center gap-6'>
            <h3 className='text-xl font-semibold text-light mt-2'>
              {fullName} {clientData?.company ? `- ${clientData?.company?.name}` : ''}
            </h3>
            {canEditClient && clientData && (
              <Button className='mt-3' variant='ghost' size='sm' onClick={handleEditClient}>
                <PencilIcon className='h-4 w-4' />
              </Button>
            )}
          </div>

          <div className='flex items-start gap-3'>
            <CalendarDays className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Date Added: </span>
              {displayDate}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <UserRound className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Contact Type: </span>
              {clientData?.contact_type?.name || 'N/A'}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <Phone className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Phone: </span>
              {clientData?.phone || clientData?.clientable?.cell_phone || 'N/A'}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <Mail className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light break-all'>
              <span className='text-gray'>Email: </span>
              {clientData?.email || 'N/A'}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <MapPin className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Address: </span>
              {displayAddress}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <div className='flex items-start gap-3'>
              <UserRound className='h-4 w-4 mt-0.5 text-gray shrink-0' />
              <p className='text-sm text-light'>
                <span className='text-gray'>Spouse Name: </span>
                {clientData?.clientable?.spouse_name || '-'}
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <Phone className='h-4 w-4 mt-0.5 text-gray shrink-0' />
              <p className='text-sm text-light'>
                <span className='text-gray'>Phone: </span>
                {clientData?.clientable?.spouse_phone || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='p-5 border-t lg:border-t-0 lg:border-l border-border/50 space-y-4'>
        <h5 className='text-lg font-semibold text-light'>
          {clientData?.type === 'lead' ? 'Lead' : 'Customer'} Information
        </h5>

        <div className='space-y-3'>
          {clientData?.type === 'lead' && (
            <div className='flex items-start gap-3'>
              <ChartBarIcon className='h-4 w-4 mt-0.5 text-gray shrink-0' />
              <p className='text-sm text-light capitalize'>
                <span className='text-gray'>Lead Stage: </span>
                {clientData?.clientable?.stage?.replace(/-/g, ' ') || 'New'}
              </p>
            </div>
          )}
          <div className='flex items-start gap-3'>
            <MapPin className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Location: </span>
              {clientData?.location?.name || 'N/A'}
            </p>
          </div>

          <div className='flex items-start gap-3'>
            <UserRound className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Sales Rep: </span>
              {displaySalesRep}
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <Clock className='h-4 w-4 mt-0.5 text-gray shrink-0' />
            <p className='text-sm text-light'>
              <span className='text-gray'>Availability: </span>
              {clientData?.clientable?.best_time ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDetailsContent
