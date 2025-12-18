'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { formatDate } from '@/utils/date'
import LeadService from '@/services/api/leads/leads.service'
import { Lead } from '@/types/leads/leads.types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface LeadDetailsProps {
  leadId: string | null
  onEdit?: (lead: Lead) => void
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId, onEdit }) => {
  const [leadData, setLeadData] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchLeadDetails = async () => {
    if (!leadId) {
      setLeadData(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await LeadService.show(leadId)
      setLeadData(response.data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch lead details')
      setLeadData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails()
    } else {
      setLeadData(null)
    }
  }, [leadId])

  if (!leadId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No lead selected</p>
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

  if (!leadData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>Lead not found</p>
      </div>
    )
  }

  const client = leadData?.client || null
  const fullName = `${client?.first_name || ''} ${client?.last_name || ''}`.trim()
  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-light mt-2'>Lead Details</h3>
        {/* <div className='mt-2'>
          <EditButton
            title='Edit'
            tooltip='Edit Lead Information'
            onClick={() => onEdit?.(leadData)}
            variant='icon'
            buttonSize='default'
            buttonVariant='ghost'
          />
        </div> */}
      </div>

      {/* Profile Section */}
      <div className='flex items-center space-x-4 p-4 bg-bg-3 rounded-lg'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={''} alt={fullName} />
          <AvatarFallback className='text-lg font-semibold'>{initials || 'L'}</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h4 className='text-lg font-medium text-light'>{fullName || 'N/A'}</h4>
          <p className='text-gray'>{client?.email || 'N/A'}</p>
          <Badge variant={client?.status === 1 ? 'default' : 'destructive'}>
            {client?.status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Lead Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Lead Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>First Name</label>
              <p className='text-light'>{client?.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Last Name</label>
              <p className='text-light'>{client?.last_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Display Name</label>
              <p className='text-light'>{client?.display_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Email</label>
              <p className='text-light'>{client?.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Phone</label>
              <p className='text-light'>{client?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Cell Phone</label>
              <p className='text-light'>{leadData?.cell_phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Address</label>
              <p className='text-light'>{leadData?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Company</label>
              <p className='text-light'>{client?.company?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Contact Type</label>
              <p className='text-light capitalize'>{client?.type || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Lead Source</label>
              <p className='text-light'>{client?.source?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Interest Level</label>
              <p className='text-light'>{client?.interest_level?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Lead Cost</label>
              <p className='text-light'>${client?.lead_cost || '0.00'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Sales Rep.</label>
              <p className='text-light'>
                {client?.reference?.first_name && client?.reference?.last_name
                  ? `${client?.reference.first_name} ${client?.reference.last_name}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Additional Information</h5>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Spouse Name</label>
              <p className='text-light'>{leadData?.spouse_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Spouse Phone</label>
              <p className='text-light'>{leadData?.spouse_phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Best Time to Contact</label>
              <p className='text-light'>{leadData?.best_time || 'N/A'}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>CC Email</label>
              <p className='text-light'>{leadData?.cc_email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Pre-Qualified Amount</label>
              <p className='text-light'>${leadData?.pre_qualifi_amount || '0.00'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase mr-2'>Tax Exempt</label>
              <Badge variant={leadData?.is_tax_exempt === 1 ? 'default' : 'secondary'}>
                {leadData?.is_tax_exempt === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className='text-xs text-gray uppercase mr-2'>QuickBooks</label>
              <Badge variant={leadData?.is_quic_book === 1 ? 'default' : 'secondary'}>
                {leadData?.is_quic_book === 1 ? 'Yes' : 'No'}
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
              {leadData?.created_at ? new Date(leadData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase'>Updated At</label>
            <p className='text-light text-sm'>
              {leadData?.updated_at ? new Date(leadData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadDetails
