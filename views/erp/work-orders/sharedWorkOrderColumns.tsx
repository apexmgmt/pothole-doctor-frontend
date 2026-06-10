import React from 'react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Column, ProposalService, WorkOrder } from '@/types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import WorkOrderDocumentService from '@/services/api/work-orders/work-order-documents.service'
import { Description } from '@/components/ui/description'

type SharedWorkOrderColumnsOptions = {
  excludeColumnIds?: string[]
}

export const getWorkOrderStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in progress':
    case 'in_progress':
      return 'info'
    case 'pending':
      return 'pending'
    case 'cancelled':
    case 'void':
      return 'destructive'
    case 'overdue':
      return 'warning'
    case 'new':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getWorkOrderTotal = (row: WorkOrder) => {
  if (row.invoice_total != null) return Number(row.invoice_total)
  if (row.total != null) return Number(row.total)

  return 0
}

const getWorkOrderProfit = (row: WorkOrder) => {
  if (row.total_profit != null) return Number(row.total_profit)
  if (row.profit != null) return Number(row.profit)

  return 0
}

export const getSharedWorkOrderColumns = (
  onOpenWorkOrder: (row: WorkOrder) => void,
  options: SharedWorkOrderColumnsOptions = {}
): Column[] => {
  const columns: Column[] = [
    {
      id: 'invoice_number',
      header: 'WO #',
      cell: (row: WorkOrder) => (
        <span className='hover:underline cursor-pointer' onClick={() => onOpenWorkOrder(row)}>
          {row?.invoice_number_prefix ? `${row.invoice_number_prefix}-` : ''}
          {row.invoice_number?.toString() || 'N/A'}
        </span>
      ),
      sortable: false
    },

    // invoice confirmation date
    // invoice date
    {
      id: 'company',
      header: 'Company',
      cell: (row: WorkOrder) => <span>{row?.client?.company?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'client_name',
      header: 'Customer',
      cell: (row: WorkOrder) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)
        const name = parts.join(' ') || ''

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
      id: 'service',
      header: 'Service',
      cell: (row: WorkOrder) => <span>{row?.work_order_type?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'title',
      header: 'Job Name',
      cell: (row: WorkOrder) => <span>{row.title}</span>,
      sortable: true
    },
    {
      id: 'service_types',
      header: 'Job Type(s)',
      cell: (row: WorkOrder) => {
        const serviceTypeNames: string[] =
          row?.services?.map((service: ProposalService) => service?.service_type?.name || '') || []

        const uniqueServiceTypeNames = Array.from(new Set(serviceTypeNames)).filter(name => name)

        return (
          <Description
            buttonClassName='text-[13px]'
            className='text-[13px]'
            description={uniqueServiceTypeNames.join(', ') || '—'}
          />
        )
      },
      sortable: false
    },
    {
      id: 'address',
      header: 'Job Address',
      cell: (row: WorkOrder) => {
        const addressParts = [row?.address?.street_address, row?.address?.city?.name, row?.address?.state?.name].filter(
          Boolean
        )

        return (
          <Description
            buttonClassName='text-[13px]'
            className='text-[13px]'
            description={addressParts.join(', ') || '—'}
          />
        )
      },
      sortable: false
    },
    {
      id: 'contractors',
      header: 'Contractor(s)',
      cell: (row: WorkOrder) => {
        const contractorNames: string[] =
          row?.services?.map(
            (service: ProposalService) =>
              service?.contractor?.userable?.company?.name ??
              [service?.contractor?.first_name, service?.contractor?.last_name].filter(Boolean).join(' ') ??
              ''
          ) || []

        const uniqueContractorNames = contractorNames.filter(name => name)

        return <Description description={uniqueContractorNames.join(', ') || '—'} />
      },
      sortable: false
    },

    // job schedule date
    // material ready for order
    // material order %
    // material paid
    // schedule complete %

    {
      id: 'completion_certificates',
      header: 'Completion Certificate Signed',
      cell: (row: WorkOrder) => {
        const certs = row.completion_certificates

        if (certs && certs.length > 0) {
          const completed = certs.filter(c => c.is_completed).length
          const total = certs.length
          const allDone = completed === total

          const pct = Math.round((completed / total) * 100)

          return (
            <div className='w-28 h-5 rounded overflow-hidden relative'>
              <div
                className={`h-full transition-all ${allDone ? 'bg-green-500' : 'bg-blue-400'}`}
                style={{ width: `${pct}%` }}
              />
              <span className='absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference'>
                {pct}%
              </span>
            </div>
          )
        }

        return (
          <div className='w-28 h-5 rounded bg-muted overflow-hidden relative'>
            <div className='h-full transition-all bg-blue-400' style={{ width: '0%' }} />
            <span className='absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference'>
              0%
            </span>
          </div>
        )
      },
      sortable: false
    },

    // contractor paid
    // salesman paid
    {
      id: 'assign_user',
      header: 'Sales Rep',
      cell: (row: WorkOrder) => (
        <span>{[row?.assign_user?.first_name, row?.assign_user?.last_name].filter(Boolean).join(' ') || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'invoice_total',
      header: 'Total Sale',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.invoice_total ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'invoice_total_tax',
      header: 'Total Tax',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.invoice_total_tax ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'total_cost',
      header: 'Total Cost',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.total_cost ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'total_profit',
      header: 'Total Profit',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.total_profit ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'commissions',
      header: 'Commissions',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.commissions ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'total_net_profit',
      header: 'Net Profit',
      cell: (row: WorkOrder) => <span>{formatCurrency(row?.total_net_profit ?? 0)}</span>,
      sortable: true
    }

    // {
    //   id: 'status',
    //   header: 'Status',
    //   cell: (row: WorkOrder) => (
    //     <Badge variant={getWorkOrderStatusVariant(row.status)} className='capitalize'>
    //       {row.status || '—'}
    //     </Badge>
    //   ),
    //   sortable: true
    // },
  ]

  if (!options.excludeColumnIds || options.excludeColumnIds.length === 0) {
    return columns
  }

  const excluded = new Set(options.excludeColumnIds)

  return columns.filter(column => !excluded.has(column.id))
}
