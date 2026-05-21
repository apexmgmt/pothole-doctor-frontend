import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Column, WorkOrder } from '@/types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

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
        <span className='font-medium hover:underline cursor-pointer' onClick={() => onOpenWorkOrder(row)}>
          {row?.invoice_number_prefix ? `${row.invoice_number_prefix}-` : ''}
          {row.invoice_number?.toString() || 'N/A'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: WorkOrder) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: WorkOrder) => <span className='font-medium'>{row?.client?.company?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'client_name',
      header: 'Customer',
      cell: (row: WorkOrder) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: false
    },
    {
      id: 'issue_date',
      header: 'Issue Date',
      cell: (row: WorkOrder) => <span className='font-medium'>{formatDate(row.issue_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'due_date',
      header: 'Due Date',
      cell: (row: WorkOrder) => <span className='font-medium'>{formatDate(row.due_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row: WorkOrder) => <span className='font-medium'>{formatCurrency(getWorkOrderTotal(row))}</span>,
      sortable: true
    },
    {
      id: 'profit',
      header: 'Profit',
      cell: (row: WorkOrder) => {
        const profit = getWorkOrderProfit(row)
        const isPositive = profit >= 0

        return (
          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(profit)}
          </span>
        )
      },
      sortable: true
    },
    {
      id: 'commissions',
      header: 'Commissions',
      cell: (row: WorkOrder) => {
        const commission = row.commissions ?? 0

        return <span className='font-medium'>{formatCurrency(commission)}</span>
      },
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: WorkOrder) => (
        <Badge variant={getWorkOrderStatusVariant(row.status)} className='capitalize'>
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
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
      sortable: true
    }
  ]

  if (!options.excludeColumnIds || options.excludeColumnIds.length === 0) {
    return columns
  }

  const excluded = new Set(options.excludeColumnIds)

  return columns.filter(column => !excluded.has(column.id))
}
