'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Client } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import ClientService from '@/services/api/clients/clients.service'

interface ClientDetailsProps {
  type: 'lead' | 'customer'
  clientId: string | null
  onEdit?: (client: Client) => void
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ type, clientId, onEdit }) => {
  const [clientData, setClientData] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchClientDetails = async () => {
    if (!clientId) {
      setClientData(null)

      return
    }

    setIsLoading(true)

    try {
      const response = await ClientService.show(clientId)

      setClientData(response.data)
    } catch (error: any) {
      toast.error(error?.message || `Failed to fetch ${type} details`)
      setClientData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchClientDetails()
    } else {
      setClientData(null)
    }
  }, [clientId])

  if (!clientId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No {type} selected</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
        </div>
        <div className='flex items-center space-x-4 p-4 bg-bg-3 rounded-lg'>
          <Skeleton className='h-16 w-16 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-6 w-20' />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>{type === 'lead' ? 'Lead' : 'Customer'} not found</p>
      </div>
    )
  }

  const fullName = `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim()

  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-light mt-2'>{type === 'lead' ? 'Lead' : 'Customer'} Details</h3>
      </div>

      {/* Profile Section */}
      <div className='flex items-center space-x-4 p-4 bg-bg-3 rounded-lg'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={''} alt={fullName} />
          <AvatarFallback className='text-lg font-semibold'>{initials || 'C'}</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h4 className='text-lg font-medium text-light'>{fullName || 'N/A'}</h4>
          <p className='text-gray'>{clientData?.email || 'N/A'}</p>
          <Badge variant={clientData?.status === 1 ? 'default' : 'destructive'}>
            {clientData?.status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Client Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>
            {type === 'lead' ? 'Lead' : 'Customer'} Information
          </h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>First Name</label>
              <p className='text-light'>{clientData?.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Last Name</label>
              <p className='text-light'>{clientData?.last_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Display Name</label>
              <p className='text-light'>{clientData?.display_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Email</label>
              <p className='text-light'>{clientData?.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Phone</label>
              <p className='text-light'>{clientData?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Cell Phone</label>
              <p className='text-light'>{clientData?.clientable?.cell_phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Address</label>
              <p className='text-light'>
                {clientData?.address?.street_address
                  ? `${clientData.address.street_address}, ${clientData.address.city?.name || ''}, ${clientData.address.state?.name || ''} ${clientData.address.zip_code || ''}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Company</label>
              <p className='text-light'>{clientData?.company?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Contact Type</label>
              <p className='text-light'>{clientData?.contact_type?.name || 'N/A'}</p>
            </div>
            {type === 'customer' && (
              <div>
                <label className='text-xs text-gray uppercase'>Location</label>
                <p className='text-light'>{clientData?.location?.name || 'N/A'}</p>
              </div>
            )}
            <div>
              <label className='text-xs text-gray uppercase'>{type === 'lead' ? 'Lead' : 'Client'} Source</label>
              <p className='text-light'>{clientData?.source?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Interest Level</label>
              <p className='text-light'>{clientData?.interest_level?.name || 'N/A'}</p>
            </div>
            {type === 'lead' && (
              <div>
                <label className='text-xs text-gray uppercase'>Lead Cost</label>
                <p className='text-light'>${clientData?.lead_cost || '0.00'}</p>
              </div>
            )}
            <div>
              <label className='text-xs text-gray uppercase'>Sales Rep.</label>
              <p className='text-light'>
                {clientData?.reference?.first_name && clientData?.reference?.last_name
                  ? `${clientData?.reference.first_name} ${clientData?.reference.last_name}`
                  : 'N/A'}
              </p>
            </div>
            {type === 'customer' && clientData?.added_by && (
              <div>
                <label className='text-xs text-gray uppercase'>Added By</label>
                <p className='text-light'>{`${clientData?.added_by.first_name} ${clientData?.added_by.last_name}`}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desired Services */}
      {clientData?.desired_services && clientData.desired_services.length > 0 && (
        <div className='space-y-4 pt-4 border-t border-border'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Desired Services</h5>
          <div className='flex flex-wrap gap-2'>
            {clientData.desired_services.map(service => (
              <Badge key={service.id} variant='secondary'>
                {service.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Additional Information</h5>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Spouse Name</label>
              <p className='text-light'>{clientData?.clientable?.spouse_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Spouse Phone</label>
              <p className='text-light'>{clientData?.clientable?.spouse_phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Best Time to Contact</label>
              <p className='text-light'>{clientData?.clientable?.best_time || 'N/A'}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>CC Email</label>
              <p className='text-light'>{clientData?.clientable?.cc_email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Pre-Qualified Amount</label>
              <p className='text-light'>${clientData?.clientable?.pre_qualified_amount || '0.00'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase mr-2'>Tax Exempt</label>
              <Badge variant={clientData?.clientable?.is_tax_exempt === 1 ? 'default' : 'secondary'}>
                {clientData?.clientable?.is_tax_exempt === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className='text-xs text-gray uppercase mr-2'>QuickBooks</label>
              <Badge variant={clientData?.clientable?.is_quick_book === 1 ? 'default' : 'secondary'}>
                {clientData?.clientable?.is_quick_book === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-gray uppercase'>Created At</label>
            <p className='text-light text-sm'>
              {clientData?.created_at ? new Date(clientData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase'>Updated At</label>
            <p className='text-light text-sm'>
              {clientData?.updated_at ? new Date(clientData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDetails
