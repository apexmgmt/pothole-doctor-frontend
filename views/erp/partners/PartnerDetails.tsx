'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Partner } from '@/types'
import PartnerService from '@/services/api/partners/partners.service'

interface PartnerDetailsProps {
  partnerId: string
}

const PartnerDetails: React.FC<PartnerDetailsProps> = ({ partnerId }) => {
  const [partnerData, setPartnerData] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchPartnerDetails = async () => {
    setIsLoading(true)

    try {
      const response = await PartnerService.show(partnerId)

      setPartnerData(response.data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch contractor details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails()
    }
  }, [partnerId])

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between pt-4'>
          <Skeleton className='h-8 w-48' />
        </div>
        <div className='flex items-center space-x-4 py-4 bg-bg-3 rounded-lg'>
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

  if (!partnerData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No contractor selected</p>
      </div>
    )
  }

  const fullName = [partnerData.first_name, partnerData.last_name].filter(Boolean).join(' ') || 'N/A'

  const fullAddress = [
    partnerData.userable?.street_address,
    partnerData.userable?.city?.name,
    partnerData.userable?.state?.name,
    partnerData.userable?.zip_code
  ]
    .filter(Boolean)
    .join(', ')

  const formatDate = (dateString: string | number | null | undefined) => {
    if (!dateString) return 'N/A'

    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return String(dateString)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between pt-4'>
        <h3 className='text-base font-medium leading-none text-light mt-2'>
          {fullName} {partnerData.userable?.company?.name ? `- ${partnerData.userable.company.name}` : ''}
        </h3>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Contact Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Contact Information</h5>
          <div className='space-y-3'>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Name : </label>
              <p className='text-light'>{fullName}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Email : </label>
              <p className='text-light'>{partnerData.email || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Phone : </label>
              <p className='text-light'>{partnerData.userable?.phone || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Fax : </label>
              <p className='text-light'>{partnerData.userable?.fax || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Company : </label>
              <p className='text-light'>{partnerData.userable?.company?.name || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Entity : </label>
              <p className='text-light capitalize'>{partnerData.userable?.entity || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Business/Contractor Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
          <div className='space-y-3'>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Contractor Type : </label>
              <p className='text-light'>{partnerData.userable?.partner_type?.name || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Schedule Color : </label>
              {partnerData.userable?.schedule_color ? (
                <div className='flex items-center gap-2'>
                  <span
                    className='w-4 h-4 rounded-full border border-border/50'
                    style={{ backgroundColor: partnerData.userable.schedule_color }}
                  />
                  <p className='text-light'>{partnerData.userable.schedule_color}</p>
                </div>
              ) : (
                <p className='text-light'>N/A</p>
              )}
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Hold Amount : </label>
              <p className='text-light'>
                {partnerData.userable?.hold_amount
                  ? `$${parseFloat(String(partnerData.userable.hold_amount)).toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Hold Amount (%) : </label>
              <p className='text-light'>
                {partnerData.userable?.hold_amount_percent
                  ? `${parseFloat(String(partnerData.userable.hold_amount_percent)).toFixed(2)}%`
                  : 'N/A'}
              </p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Insurance Expiry : </label>
              <p className='text-light'>{formatDate(partnerData.userable?.insurance_expiration)}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>W9 Expiry : </label>
              <p className='text-light'>{formatDate(partnerData.userable?.w9_expiration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax / Identification & Address */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Identification & Address</h5>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>EIN : </label>
              <p className='text-light'>{partnerData.userable?.ein || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>SSN : </label>
              <p className='text-light'>{partnerData.userable?.ssn || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>In House : </label>
              <Badge variant={partnerData.userable?.in_house_contractor === 1 ? 'default' : 'secondary'}>
                {partnerData.userable?.in_house_contractor === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Address : </label>
              <p className='text-light'>{fullAddress || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2.5'>
              <label className='text-xs text-gray uppercase min-w-25'>Zip Code : </label>
              <p className='text-light'>{partnerData.userable?.zip_code || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Locations */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border'>
        {/* Skills */}
        <div className='space-y-3'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Skills</h5>
          {partnerData.userable?.skills && partnerData.userable.skills.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {partnerData.userable.skills.map(skill => (
                <Badge key={skill.id} variant='outline'>
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-gray text-sm'>No skills specified</p>
          )}
        </div>

        {/* Locations */}
        <div className='space-y-3'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Serviced Locations</h5>
          {partnerData.userable?.locations && partnerData.userable.locations.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {partnerData.userable.locations.map(location => (
                <Badge key={location.id} variant='outline'>
                  {location.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-gray text-sm'>No locations specified</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {partnerData.userable?.notes && (
        <div className='space-y-2 flex items-center gap-2.5 pt-4 border-t border-border'>
          <label className='text-xs text-gray uppercase min-w-25'>Notes : </label>
          <p className='text-light whitespace-pre-wrap'>{partnerData.userable.notes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex items-center gap-2.5'>
            <label className='text-xs text-gray uppercase min-w-25'>Created At : </label>
            <p className='text-light text-sm'>
              {partnerData.created_at ? new Date(partnerData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className='flex items-center gap-2.5'>
            <label className='text-xs text-gray uppercase min-w-25'>Updated At : </label>
            <p className='text-light text-sm'>
              {partnerData.updated_at ? new Date(partnerData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerDetails
