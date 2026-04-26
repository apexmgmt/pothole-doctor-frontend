'use client'

import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CommonTable from '@/components/erp/common/table'
import { Column, ProposalHistory } from '@/types'
import ProposalService from '@/services/api/estimates/proposals.service'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ProposalHistoryModal = ({
  open,
  onOpenChange,
  proposalId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
}) => {
  const [histories, setHistories] = useState<ProposalHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterOptions, setFilterOptions] = useState<any>({ per_page: 10, page: 1 })
  const [apiMeta, setApiMeta] = useState<any>(null)

  const fetchHistories = async (filters = filterOptions) => {
    setIsLoading(true)

    try {
      const response = await ProposalService.histories(proposalId, filters)

      if (response.data) {
        setHistories(response.data.data || response.data)
        setApiMeta(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch proposal histories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && proposalId) {
      fetchHistories(filterOptions)
    }
  }, [open, proposalId])

  useEffect(() => {
    if (open && proposalId) {
      fetchHistories(filterOptions)
    }
  }, [filterOptions])

  const columns: Column[] = [
    {
      id: 'sent_at',
      header: 'Sent At',
      cell: (row: ProposalHistory) => <div className='flex items-center'>{formatDate(row.sent_at)}</div>,
      sortable: true
    },
    {
      id: 'sent_by',
      header: 'Sent By',
      cell: (row: ProposalHistory) => (
        <span className='font-medium'>{row.sent_by_user?.first_name + ' ' + row.sent_by_user?.last_name || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'email_to',
      header: 'Sent To',
      cell: (row: ProposalHistory) => (
        <span>{row?.client?.first_name + ' ' + row?.client?.last_name || row.email_to || '—'}</span>
      ),
      sortable: false
    },

    // {
    //   id: 'subject',
    //   header: 'Subject',
    //   cell: (row: ProposalHistory) => (
    //     <span className='max-w-[200px] truncate block' title={row.subject}>
    //       {row.subject || '—'}
    //     </span>
    //   ),
    //   sortable: false
    // },
    {
      id: 'total',
      header: 'Total',
      cell: (row: ProposalHistory) => (
        <span className='font-semibold'>
          ${Number(row.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
      sortable: false
    },
    {
      id: 'review',
      header: 'Review',
      cell: (row: ProposalHistory) =>
        row.review ? (
          <span className='max-w-[220px] truncate block text-yellow-300' title={row.review}>
            {row.review}
          </span>
        ) : (
          <span className='text-zinc-500 text-xs'>No Review</span>
        ),
      sortable: false
    }
  ]

  const handleRowSelect = (row: ProposalHistory) => {
    const r = row as any
    const pid: string = r?.p_id
    const qcid: string = r?.qc_id

    if (pid && qcid) {
      window.open(`/proposal?p_id=${pid}&qc_id=${qcid}&h=${row.id}`, '_blank')
    }
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Proposal History'
      description='All sent revisions and their client interactions.'
      maxWidth='7xl'
      isLoading={false}
      actions={
        <Button variant='outline' onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <CommonTable
        data={{
          data: histories,
          per_page: apiMeta?.per_page ?? filterOptions.per_page,
          total: apiMeta?.total ?? histories.length,
          from: apiMeta?.from ?? 1,
          to: apiMeta?.to ?? histories.length,
          current_page: apiMeta?.current_page ?? 1,
          last_page: apiMeta?.last_page ?? 1
        }}
        columns={columns}
        setFilterOptions={setFilterOptions}
        showFilters={false}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No proposal history found'
        handleRowSelect={handleRowSelect}
      />
    </CommonDialog>
  )
}

export default ProposalHistoryModal
