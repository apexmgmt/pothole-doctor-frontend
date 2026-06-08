'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Client } from '@/types'
import { formatDate } from '@/utils/date'
import { CalendarDays, Mail, MapPin, Phone, UserRound, ChartBarIcon, Clock, SquarePen } from 'lucide-react'

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

  const clientInfoItems = [
    {
      icon: CalendarDays,
      label: 'Date Added',
      value: displayDate
    },
    {
      icon: UserRound,
      label: 'Contact Type',
      value: clientData?.contact_type?.name || 'N/A'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: clientData?.phone || clientData?.clientable?.cell_phone || 'N/A'
    },
    {
      icon: Mail,
      label: 'Email',
      value: clientData?.email || 'N/A',
      className: 'break-all'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: displayAddress
    },
    {
      icon: UserRound,
      label: 'Spouse Name',
      value: clientData?.clientable?.spouse_name || '-'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: clientData?.clientable?.spouse_phone || '-'
    }
  ]

  const additionalInfoItems = [
    ...(clientData?.type === 'lead'
      ? [
          {
            icon: ChartBarIcon,
            label: 'Lead Stage',
            value: clientData?.clientable?.stage?.replace(/-/g, ' ') || 'New',
            className: 'capitalize'
          }
        ]
      : []),
    {
      icon: MapPin,
      label: 'Location',
      value: clientData?.location?.name || 'N/A'
    },
    {
      icon: UserRound,
      label: 'Sales Rep',
      value: displaySalesRep
    },
    {
      icon: Clock,
      label: 'Availability',
      value: clientData?.clientable?.best_time ?? '-'
    }
  ]

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 p-5'>
      <div className='pb-5 lg:pb-0 lg:pe-5'>
        {/* Header */}
        <div className='flex justify-between items-center gap-6'>
          <h3 className='text-base font-medium leading-none text-light'>
            {fullName} {clientData?.company ? `- ${clientData?.company?.name}` : ''}
          </h3>
          {canEditClient && clientData && (
            <Button className='h-9' variant='outline' size='sm' onClick={handleEditClient}>
              <SquarePen className='size-[15px]' /> <span>Edit</span>
            </Button>
          )}
        </div>

        <div className='flex flex-col gap-y-4 mt-5'>
          {clientInfoItems.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={index} className='grid grid-cols-[148px_minmax(0,_1fr)]'>
                <div className='flex items-center gap-1.5'>
                  <Icon className='size-4.5 text-muted-foreground' />
                  <p className='text-xs font-medium leading-none'>{item.label}:</p>
                </div>
                <p className={`text-xs text-light ${item.className || ''}`.trim()}>{item.value}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className='pt-5 lg:pt-0 lg:ps-5 border-t lg:border-t-0 lg:border-l border-border/50'>
        <h5 className='text-base font-medium leading-none text-light'>Information</h5>

        <div className='flex flex-col gap-y-4 mt-5'>
          {additionalInfoItems.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={index} className='grid grid-cols-[148px_minmax(0,_1fr)]'>
                <div className='flex items-center gap-1.5'>
                  <Icon className='size-4.5 text-muted-foreground' />
                  <p className='text-xs font-medium leading-none'>{item.label}:</p>
                </div>
                <p className={`text-xs text-light ${item.className || ''}`.trim()}>{item.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ClientDetailsContent
