'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import EditButton from '@/components/erp/common/buttons/EditButton'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import { BusinessLocation } from '@/types'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'

interface BusinessLocationDetailsProps {
  businessLocationId: string
  fetchData?: () => void
}

const BusinessLocationDetails: React.FC<BusinessLocationDetailsProps> = ({ businessLocationId, fetchData }) => {
  const [businessLocationData, setBusinessLocationData] = useState<BusinessLocation | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchBusinessLocationDetails = async () => {
    setIsLoading(true)
    try {
      const response = await BusinessLocationService.show(businessLocationId)
      setBusinessLocationData(response.data)
      if (fetchData) {
        fetchData()
      }
    } catch (error: any) {
      console.error('Error fetching business location details:', error)
      toast.error(error?.message || 'Failed to fetch business location details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (businessLocationId) {
      fetchBusinessLocationDetails()
    }
  }, [businessLocationId])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!businessLocationData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-muted-foreground'>No business location selected</p>
      </div>
    )
  }

  const locationName = businessLocationData.name || 'N/A'
  const initials = locationName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between mt-4'>
        <h3 className='text-xl font-semibold'>Business Location Details</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Business Location Information'
          link={`/erp/locations/businesses/${businessLocationData.id}/edit`}
          variant='text'
          buttonSize='default'
          buttonVariant='outline'
        />
      </div>

      {/* Profile Section */}
      <div className='flex items-center space-x-4 p-4 bg-muted rounded-lg'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={businessLocationData.logo} alt={locationName} />
          <AvatarFallback className='text-lg font-semibold'>{initials}</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h4 className='text-lg font-medium'>{locationName}</h4>
          <p className='text-sm text-muted-foreground'>{businessLocationData.email}</p>
          {businessLocationData.is_branding === 1 && (
            <Badge variant='default' className='mt-1'>
              Custom Branding Enabled
            </Badge>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1024px]'>
        {/* Contact Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>Contact Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Location Name</label>
              <p className='text-sm font-medium'>{businessLocationData.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Email</label>
              <p className='text-sm font-medium'>{businessLocationData.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Phone</label>
              <p className='text-sm font-medium'>{businessLocationData.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Fax</label>
              <p className='text-sm font-medium'>{businessLocationData.fax || 'N/A'}</p>
            </div>
            {businessLocationData.website && (
              <div>
                <label className='text-xs text-muted-foreground uppercase'>Website</label>
                <a
                  href={businessLocationData.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm font-medium text-primary hover:underline block'
                >
                  {businessLocationData.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>Business Information</h5>
          <div className='space-y-3'>
            {businessLocationData.invoice_prefix && (
              <div>
                <label className='text-xs text-muted-foreground uppercase'>Invoice Prefix</label>
                <p className='text-sm font-medium'>{businessLocationData.invoice_prefix}</p>
              </div>
            )}
            {businessLocationData.sales_tax !== undefined && businessLocationData.sales_tax !== null && (
              <div>
                <label className='text-xs text-muted-foreground uppercase'>Sales Tax</label>
                <p className='text-sm font-medium'>{businessLocationData.sales_tax}%</p>
              </div>
            )}
            {businessLocationData.review_link && (
              <div>
                <label className='text-xs text-muted-foreground uppercase'>Review Link</label>
                <a
                  href={businessLocationData.review_link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm font-medium text-primary hover:underline block'
                >
                  View Reviews
                </a>
              </div>
            )}
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Branding</label>
              <p className='text-sm font-medium'>{businessLocationData.is_branding === 1 ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className='space-y-4 md:col-span-2'>
          <h5 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>Address Information</h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Street Address</label>
              <p className='text-sm font-medium'>{businessLocationData.street_address || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>City</label>
              <p className='text-sm font-medium'>{businessLocationData.city?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>State</label>
              <p className='text-sm font-medium'>
                {businessLocationData.state?.name || businessLocationData.city?.state?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className='text-xs text-muted-foreground uppercase'>Country</label>
              <p className='text-sm font-medium'>{businessLocationData.city?.state?.country?.name || 'N/A'}</p>
            </div>
            {businessLocationData.zip_code && (
              <div>
                <label className='text-xs text-muted-foreground uppercase'>ZIP Code</label>
                <p className='text-sm font-medium'>{businessLocationData.zip_code}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-muted-foreground uppercase'>Created At</label>
            <p className='text-sm font-medium'>
              {businessLocationData.created_at ? new Date(businessLocationData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-muted-foreground uppercase'>Updated At</label>
            <p className='text-sm font-medium'>
              {businessLocationData.updated_at ? new Date(businessLocationData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessLocationDetails
