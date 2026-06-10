import React from 'react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Description } from '@/components/ui/description'
import { Column, Invoice, ProposalService } from '@/types'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'

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
      <span className='hover:underline cursor-pointer' onClick={() => onOpenInvoice(row)}>
        {row?.invoice_number_prefix ? `${row.invoice_number_prefix}-` : ''}
        {row.invoice_number?.toString() || 'N/A'}
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
    cell: (row: Invoice) => <span>{formatDate(row.created_at || '') || '—'}</span>,
    sortable: true
  },
  {
    id: 'invoice_confirmation_date',
    header: 'Invoice Confirmation Date',
    cell: (row: Invoice) => <span>{formatDate(row.invoice_confirmation_date || '') || '—'}</span>,
    sortable: true
  },

  // final invoice sent date
  {
    id: 'company',
    header: 'Company',
    cell: (row: Invoice) => <span>{row?.client?.company?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'client',
    header: 'Customer',
    cell: (row: Invoice) => {
      const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)
      const name = parts.join(' ') || '—'

      if (row?.client?.id) {
        return (
          <Link href={`/erp/customers?client_id=${row.client.id}`} className='hover:underline cursor-pointer'>
            {name}
          </Link>
        )
      }

      return <span>{name}</span>
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

      return (
        <Description
          className='text-[13px]'
          buttonClassName='text-[13px]'
          description={addressParts.join(', ') || '—'}
        />
      )
    },
    sortable: false
  },
  {
    id: 'invoice_type',
    header: 'Invoice Type',
    cell: (row: Invoice) => <span>{row?.invoice_type?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'service_site_contact',
    header: 'Service Site Contact',
    cell: (row: Invoice) => {
      const contactParts = [
        row?.address?.email ?? row?.client?.email,
        row?.address?.phone ?? row?.client?.phone
      ].filter(Boolean)

      return (
        <Description
          className='text-[13px]'
          buttonClassName='text-[13px]'
          description={contactParts.join('\n') || '—'}
        />
      )
    },
    sortable: false
  },
  {
    id: 'title',
    header: 'Job Name',
    cell: (row: Invoice) => <span>{row?.title || '—'}</span>,
    sortable: true
  },
  {
    id: 'location',
    header: 'Location',
    cell: (row: Invoice) => <span>{row?.location?.name || '—'}</span>,
    sortable: false
  },
  {
    id: 'assign_user',
    header: 'Sales Rep',
    cell: (row: Invoice) => (
      <span>{[row?.assign_user?.first_name, row?.assign_user?.last_name].filter(Boolean).join(' ') || '—'}</span>
    ),
    sortable: false
  },
  {
    id: 'total_material_sale',
    header: 'Material Sale',
    cell: (row: Invoice) => <span>{formatCurrency(row?.total_material_sale ?? 0)}</span>,
    sortable: true
  },
  {
    id: 'total_labor_sale',
    header: 'Labor Sale',
    cell: (row: Invoice) => <span>{formatCurrency(row?.total_labor_sale ?? 0)}</span>,
    sortable: true
  },
  {
    id: 'discount',
    header: 'Discount',
    cell: (row: Invoice) => <span>{formatCurrency(row?.discount ?? 0)}</span>,
    sortable: true
  },
  {
    id: 'total',
    header: 'Total',
    cell: (row: Invoice) => <span>{formatCurrency(row?.total ?? 0)}</span>,
    sortable: true
  },
  {
    id: 'sale_tax',
    header: 'Total Tax',
    cell: (row: Invoice) => <span>{formatCurrency(row?.sale_tax ?? 0)}</span>,
    sortable: true
  },
  {
    id: 'total_payment',
    header: 'Total Payment',
    cell: (row: Invoice) => <span>{formatCurrency(0)}</span>,
    sortable: false
  },
  {
    id: 'due_amount',
    header: 'Customer Balance',
    cell: (row: Invoice) => <span>{formatCurrency(0)}</span>,
    sortable: false
  },
  {
    id: 'work_order_total_cost',
    header: 'WO Total Cost',
    cell: (row: Invoice) => <span>{formatCurrency(row?.work_order?.total_cost ?? row?.total_cost ?? 0)}</span>,
    sortable: false
  },
  {
    id: 'work_order_profit',
    header: 'WO Profit',
    cell: (row: Invoice) => <span>{formatCurrency(row?.work_order?.total_profit ?? row?.total_profit ?? 0)}</span>,
    sortable: false
  }
]
