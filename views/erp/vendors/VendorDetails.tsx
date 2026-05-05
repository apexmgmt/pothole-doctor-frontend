'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import VendorService from '@/services/api/vendors/vendors.service'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { Vendor } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface VendorDetailsProps {
  vendorId: string
  onEdit?: (vendor: Vendor) => void
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ vendorId, onEdit }) => {
  const [vendorData, setVendorData] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchVendorDetails = async () => {
    setIsLoading(true)

    try {
      const response = await VendorService.show(vendorId)

      setVendorData(response.data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch vendor details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails()
    }
  }, [vendorId])

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
          {/* <Skeleton className='h-10 w-24' /> */}
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

  if (!vendorData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No vendor selected</p>
      </div>
    )
  }

  const fullName = vendorData.first_name || 'N/A'

  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  const fullAddress = [
    vendorData.userable?.street_address,
    vendorData.userable?.city?.name,
    vendorData.userable?.state?.name,
    vendorData.userable?.zip_code
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-light mt-2'>Vendor Details</h3>
        {/* <div className='mt-2'>
          <EditButton
            title='Edit'
            tooltip='Edit Vendor Information'
            onClick={() => onEdit?.(vendorData)}
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
          <AvatarFallback className='text-lg font-semibold'>{initials || 'V'}</AvatarFallback>
        </Avatar>
        <div className=''>
          <h4 className='text-lg/[1.1] font-medium text-light'>{fullName}</h4>
          <p className='text-gray text-sm/tight'>{vendorData.email}</p>
          <Badge variant={vendorData.status ? 'default' : 'destructive'}>
            {vendorData.status ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Contact Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Contact Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Vendor Name</label>
              <p className='text-light'>{vendorData.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Email</label>
              <p className='text-light'>{vendorData.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Phone</label>
              <p className='text-light'>{vendorData.userable?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Fax</label>
              <p className='text-light'>{vendorData.userable?.fax_number || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Website</label>
              <p className='text-light break-all'>{vendorData.userable?.website || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Account Number</label>
              <p className='text-light'>{vendorData.userable?.number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Payment Term</label>
              <p className='text-light'>{vendorData.userable?.payment_term?.name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Tax Type</label>
              <p className='text-light capitalize'>{vendorData.userable?.tax_type?.replace(/-/g, ' ') || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Profit Margin</label>
              <p className='text-light'>{vendorData.userable?.profit_margin}%</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Full Address</label>
              <p className='text-light'>{fullAddress || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Zip Code</label>
              <p className='text-light'>{vendorData.userable?.zip_code || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* B2B Information */}
      {vendorData.userable?.is_enable_b2b === 1 && (
        <div className='space-y-4 pt-4 border-t border-border'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>B2B Integration</h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-gray uppercase'>B2B Status</label>
                <br />
                <Badge variant='default'>Enabled</Badge>
              </div>
              <div>
                <label className='text-xs text-gray uppercase'>Host URL</label>
                <p className='text-light break-all'>{vendorData.userable?.b2b_host_url || 'N/A'}</p>
              </div>
              <div>
                <label className='text-xs text-gray uppercase'>Port Number</label>
                <p className='text-light'>{vendorData.userable?.b2b_port_number || 'N/A'}</p>
              </div>
            </div>
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-gray uppercase'>Vendor ID</label>
                <p className='text-light'>{vendorData.userable?.b2b_vendor_id || 'N/A'}</p>
              </div>
              <div>
                <label className='text-xs text-gray uppercase'>Username</label>
                <p className='text-light'>{vendorData.userable?.b2b_username || 'N/A'}</p>
              </div>
              <div>
                <label className='text-xs text-gray uppercase'>Vendor Folder</label>
                <p className='text-light'>{vendorData.userable?.b2b_vendor_folder || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {vendorData.userable?.note && (
        <div className='space-y-2 pt-4 border-t border-border'>
          <label className='text-xs text-gray uppercase'>Notes</label>
          <p className='text-light whitespace-pre-wrap'>{vendorData.userable.note}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-gray uppercase'>Created At</label>
            <p className='text-light text-sm'>
              {vendorData.created_at ? new Date(vendorData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase'>Updated At</label>
            <p className='text-light text-sm'>
              {vendorData.updated_at ? new Date(vendorData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDetails
