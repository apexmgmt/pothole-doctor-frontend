'use client'

import React from 'react'

import ReusableInvoiceTable from '@/views/erp/invoices/ReusableInvoiceTable'

const BusinessLocationInvoices: React.FC<{ locationId: string }> = ({ locationId }) => {
  return (
    <ReusableInvoiceTable
      fixedFilters={{ location_id: locationId }}
      hiddenColumnIds={['location']}
      emptyMessage='No invoices found for this location'
    />
  )
}

export default BusinessLocationInvoices
