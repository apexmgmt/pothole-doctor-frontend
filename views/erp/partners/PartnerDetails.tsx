'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Partner } from '@/types'
import PartnerService from '@/services/api/partners/partners.service'
import DetailItem from '@/components/erp/common/DetailItem'

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
      <div className='space-y-6 mt-2.5'>
        {/* Header */}
        <div className='flex items-center justify-between pt-4'>
          <Skeleton className='h-8 w-48' />
        </div>

        {/* Details Content Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left Column (Contact Info) */}
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-11/12' />
            </div>
          </div>
          {/* Right Column (Business Info) */}
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-11/12' />
            </div>
          </div>
        </div>

        {/* Skills & Locations Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='flex flex-wrap gap-1.5'>
              <Skeleton className='h-6 w-16 rounded-full' />
              <Skeleton className='h-6 w-20 rounded-full' />
              <Skeleton className='h-6 w-14 rounded-full' />
            </div>
          </div>
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='flex flex-wrap gap-1.5'>
              <Skeleton className='h-6 w-24 rounded-full' />
              <Skeleton className='h-6 w-18 rounded-full' />
            </div>
          </div>
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
            <DetailItem label='Name' value={fullName} />
            <DetailItem label='Email' value={partnerData.email || 'N/A'} />
            <DetailItem label='Phone' value={partnerData.userable?.phone || 'N/A'} />
            <DetailItem label='Fax' value={partnerData.userable?.fax || 'N/A'} />
            <DetailItem label='Company' value={partnerData.userable?.company?.name || 'N/A'} />
            <DetailItem label='Entity' value={partnerData.userable?.entity || 'N/A'} valueClassName='capitalize' />
          </div>
        </div>

        {/* Business/Contractor Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
          <div className='space-y-3'>
            <DetailItem
              label='Contractor Type'
              value={partnerData.userable?.partner_type?.name || 'N/A'}
              labelClassName='min-w-32'
            />
            <DetailItem
              label='Schedule Color'
              value={
                partnerData.userable?.schedule_color ? (
                  <div className='flex items-center gap-2'>
                    <span
                      className='w-4 h-4 rounded-full border border-border/50'
                      style={{ backgroundColor: partnerData.userable.schedule_color }}
                    />
                    <span>{partnerData.userable.schedule_color}</span>
                  </div>
                ) : (
                  'N/A'
                )
              }
              labelClassName='min-w-32'
            />
            <DetailItem
              label='Hold Amount'
              value={
                partnerData.userable?.hold_amount
                  ? `$${parseFloat(String(partnerData.userable.hold_amount)).toFixed(2)}`
                  : 'N/A'
              }
              labelClassName='min-w-32'
            />
            <DetailItem
              label='Hold Amount (%)'
              value={
                partnerData.userable?.hold_amount_percent
                  ? `${parseFloat(String(partnerData.userable.hold_amount_percent)).toFixed(2)}%`
                  : 'N/A'
              }
              labelClassName='min-w-32'
            />
            <DetailItem
              label='Insurance Expiry'
              value={formatDate(partnerData.userable?.insurance_expiration)}
              labelClassName='min-w-32'
            />
            <DetailItem
              label='W9 Expiry'
              value={formatDate(partnerData.userable?.w9_expiration)}
              labelClassName='min-w-32'
            />
          </div>
        </div>
      </div>

      {/* Tax / Identification & Address */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Identification & Address</h5>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <DetailItem label='EIN' value={partnerData.userable?.ein || 'N/A'} labelClassName='min-w-16' />
            <DetailItem label='SSN' value={partnerData.userable?.ssn || 'N/A'} labelClassName='min-w-16' />
            <DetailItem
              label='In House'
              value={
                <Badge variant={partnerData.userable?.in_house_contractor === 1 ? 'default' : 'secondary'}>
                  {partnerData.userable?.in_house_contractor === 1 ? 'Yes' : 'No'}
                </Badge>
              }
              labelClassName='min-w-16'
            />
          </div>
          <div className='space-y-3'>
            <DetailItem label='Address' value={fullAddress || 'N/A'} labelClassName='min-w-16' />
            <DetailItem label='Zip Code' value={partnerData.userable?.zip_code || 'N/A'} labelClassName='min-w-16' />
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
        <div className='pt-4 border-t border-border'>
          <DetailItem label='Notes' value={partnerData.userable.notes} valueClassName='whitespace-pre-wrap' />
        </div>
      )}

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <DetailItem
            label='Created At'
            value={partnerData.created_at ? new Date(partnerData.created_at).toLocaleString() : 'N/A'}
            valueClassName='text-sm'
          />
          <DetailItem
            label='Updated At'
            value={partnerData.updated_at ? new Date(partnerData.updated_at).toLocaleString() : 'N/A'}
            valueClassName='text-sm'
          />
        </div>
      </div>
    </div>
  )
}

export default PartnerDetails
