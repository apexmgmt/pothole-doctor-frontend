'use client'

import React from 'react'

import { Vendor } from '@/types'
import { Badge } from '@/components/ui/badge'
import DetailItem from '@/components/erp/common/DetailItem'

interface VendorDetailsContentProps {
  vendorData: Vendor
}

const VendorDetailsContent: React.FC<VendorDetailsContentProps> = ({ vendorData }) => {
  const fullName = vendorData.first_name || 'N/A'

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
      <div className='flex items-center justify-between pt-4'>
        <h3 className='text-base font-medium leading-none text-light mt-2'>{fullName}</h3>
      </div>

      {/* Details Info (Always Visible) */}
      <div className='space-y-6'>
        {/* Details Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Contact Information */}
          <div className='space-y-4'>
            <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Contact Information</h5>
            <div className='space-y-3'>
              <DetailItem label='Vendor Name' value={fullName} />
              <DetailItem label='Email' value={vendorData.email || 'N/A'} />
              <DetailItem label='Phone' value={vendorData.userable?.phone || 'N/A'} />
              <DetailItem label='Fax' value={vendorData.userable?.fax_number || 'N/A'} />
              <DetailItem label='Website' value={vendorData.userable?.website || 'N/A'} valueClassName='break-all' />
              <DetailItem label='Account Number' value={vendorData.userable?.number || 'N/A'} />
            </div>
          </div>

          {/* Business Information */}
          <div className='space-y-4'>
            <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Business Information</h5>
            <div className='space-y-3'>
              <DetailItem label='Payment Term' value={vendorData.userable?.payment_term?.name || 'N/A'} />
              <DetailItem label='Tax Type' value={vendorData.userable?.tax_type?.replace(/-/g, ' ') || 'N/A'} valueClassName='capitalize' />
              <DetailItem label='Profit Margin' value={vendorData.userable?.profit_margin ? `${vendorData.userable.profit_margin}%` : 'N/A'} />
              <DetailItem label='Full Address' value={fullAddress || 'N/A'} />
              <DetailItem label='Zip Code' value={vendorData.userable?.zip_code || 'N/A'} />
            </div>
          </div>
        </div>

        {/* B2B Information */}
        {vendorData.userable?.is_enable_b2b === 1 && (
          <div className='space-y-4 pt-4 border-t border-border'>
            <h5 className='text-sm font-medium text-light uppercase tracking-wide'>B2B Integration</h5>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <DetailItem
                  label='B2B Status'
                  value={<Badge variant='default'>Enabled</Badge>}
                />
                <DetailItem label='Host URL' value={vendorData.userable?.b2b_host_url || 'N/A'} valueClassName='break-all' />
                <DetailItem label='Port Number' value={vendorData.userable?.b2b_port_number || 'N/A'} />
              </div>
              <div className='space-y-3'>
                <DetailItem label='Vendor ID' value={vendorData.userable?.b2b_vendor_id || 'N/A'} />
                <DetailItem label='Username' value={vendorData.userable?.b2b_username || 'N/A'} />
                <DetailItem label='Vendor Folder' value={vendorData.userable?.b2b_vendor_folder || 'N/A'} />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {vendorData.userable?.note && (
          <div className='pt-4 border-t border-border'>
            <DetailItem label='Notes' value={vendorData.userable.note} valueClassName='whitespace-pre-wrap' />
          </div>
        )}

        {/* Timestamps */}
        <div className='pt-4 border-t border-border'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <DetailItem
              label='Created At'
              value={vendorData.created_at ? new Date(vendorData.created_at).toLocaleString() : 'N/A'}
              valueClassName='text-sm'
            />
            <DetailItem
              label='Updated At'
              value={vendorData.updated_at ? new Date(vendorData.updated_at).toLocaleString() : 'N/A'}
              valueClassName='text-sm'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDetailsContent
