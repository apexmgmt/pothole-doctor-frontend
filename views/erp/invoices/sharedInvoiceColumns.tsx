import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Description } from '@/components/ui/description'
import { Column, Invoice, ProposalService } from '@/types'
import { formatDate } from '@/utils/date'

export const getInvoiceStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success'
    case 'overdue':
      return 'destructive'
    case 'sent':
    case 'sent to customer':
      return 'warning'
    case 'viewed':
    case 'viewed by customer':
      return 'info'
    case 'void':
      return 'destructive'
    case 'new':
      return 'secondary'
    default:
      return 'outline'
  }
}

export const getSharedInvoiceColumns = (onOpenInvoice: (row: Invoice) => void): Column[] => [
  {
    id: 'invoice_number',
    header: 'Invoice #',
    cell: (row: Invoice) => (
      <span className='font-medium hover:underline cursor-pointer' onClick={() => onOpenInvoice(row)}>
        {row.invoice_number?.toString().padStart(6, '0') || 'N/A'}
      </span>
    ),
    sortable: false
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row: Invoice) => (
      <Badge variant={getInvoiceStatusVariant(row.status)} className='capitalize'>
        {row.status || '—'}
      </Badge>
    ),
    sortable: true
  },
  {
    id: 'created_at',
    header: 'Created Date',
    cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.created_at || '') || '—'}</span>,
    sortable: true
  },
  {
    id: 'issue_date',
    header: 'Invoice Date',
    cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.issue_date || '') || '—'}</span>,
    sortable: true
  },
  {
    id: 'company',
    header: 'Company',
    cell: (row: Invoice) => <span className='font-medium'>{row?.client?.company?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'client',
    header: 'Customer',
    cell: (row: Invoice) => {
      const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

      return <span className='font-medium'>{parts.join(' ') || '—'}</span>
    },
    sortable: false
  },
  {
    id: 'service_types',
    header: 'Service Type(s)',
    cell: (row: Invoice) => {
      const serviceTypeNames: string[] =
        row?.services?.map((service: ProposalService) => service?.service_type?.name || '') || []

      const uniqueServiceTypeNames = Array.from(new Set(serviceTypeNames)).filter(name => name)

      return <Description description={uniqueServiceTypeNames.join(', ') || '—'} />
    },
    sortable: false
  },
  {
    id: 'address',
    header: 'Job Address',
    cell: (row: Invoice) => {
      const addressParts = [row?.address?.street_address, row?.address?.city?.name, row?.address?.state?.name].filter(
        Boolean
      )

      return <Description description={addressParts.join(', ') || '—'} />
    },
    sortable: false
  },
  {
    id: 'invoice_type',
    header: 'Invoice Type',
    cell: (row: Invoice) => <span className='font-medium'>{row?.invoice_type?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'service_site_contact',
    header: 'Service Site Contact',
    cell: (row: Invoice) => {
      const contactParts = [row?.address?.email, row?.address?.phone].filter(Boolean)

      return <Description description={contactParts.join(' | ') || '—'} />
    },
    sortable: false
  },
  {
    id: 'title',
    header: 'Job Name',
    cell: (row: Invoice) => <span className='font-medium'>{row.title || '—'}</span>,
    sortable: true
  },
  {
    id: 'location',
    header: 'Location',
    cell: (row: Invoice) => <span className='font-medium'>{row?.location?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'assign_user',
    header: 'Sales Rep',
    cell: (row: Invoice) => (
      <span className='font-medium'>
        {[row?.assign_user?.first_name, row?.assign_user?.last_name].filter(Boolean).join(' ') || '—'}
      </span>
    ),
    sortable: false
  },
  {
    id: 'due_date',
    header: 'Due Date',
    cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.due_date || '') || '—'}</span>,
    sortable: true
  },
  {
    id: 'discount',
    header: 'Discount',
    cell: (row: Invoice) => (
      <span className='font-medium'>${row.discount != null ? Number(row.discount).toFixed(2) : '0.00'}</span>
    ),
    sortable: true
  },
  {
    id: 'total',
    header: 'Total',
    cell: (row: Invoice) => (
      <span className='font-medium'>${row.total != null ? Number(row.total).toFixed(2) : '0.00'}</span>
    ),
    sortable: true
  },
  {
    id: 'sale_tax',
    header: 'Total Tax',
    cell: (row: Invoice) => (
      <span className='font-medium'>${row.sale_tax != null ? Number(row.sale_tax).toFixed(2) : '0.00'}</span>
    ),
    sortable: true
  }
]
