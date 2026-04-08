'use client'

import React, { useState, useEffect } from 'react'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, InventoryAdjustment, PurchaseOrder } from '@/types'
import InventoryService from '@/services/api/products/inventories.service'
import AdjustInventoryModal from './AdjustInventoryModal'

interface InventoryAdjustmentSectionProps {
  inventory: PurchaseOrder
  product: Product
}

const InventoryAdjustmentSection: React.FC<InventoryAdjustmentSectionProps> = ({ inventory, product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filterOptions, setFilterOptions] = useState<any>({ purchase_order_id: inventory.id })

  useEffect(() => {
    setFilterOptions({ purchase_order_id: inventory.id })
  }, [inventory.id])

  const fetchAdjustments = async () => {
    setIsLoading(true)
    InventoryService.getAdjustments(filterOptions)
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch adjustments')
      })
  }

  useEffect(() => {
    fetchAdjustments()
  }, [filterOptions])

  const handleModalSuccess = () => {
    fetchAdjustments()
  }

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (_row: InventoryAdjustment, rowIndex: number | undefined) => {
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'previous_quantity',
      header: 'Previous Qty',
      cell: (row: InventoryAdjustment) => <span className='font-medium'>{row.previous_quantity}</span>,
      sortable: false
    },
    {
      id: 'adjustment_quantity',
      header: 'Adj. Qty',
      cell: (row: InventoryAdjustment) => (
        <span className={`font-medium ${row.adjustment_quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {row.adjustment_quantity >= 0 ? '+' : ''}
          {row.adjustment_quantity}
        </span>
      ),
      sortable: false
    },
    {
      id: 'new_quantity',
      header: 'New Qty',
      cell: (row: InventoryAdjustment) => <span className='font-medium'>{row.new_quantity}</span>,
      sortable: false
    },
    {
      id: 'reason',
      header: 'Reason / Comments',
      cell: (row: InventoryAdjustment) => <span className='font-medium'>{row.reason || '—'}</span>,
      sortable: false
    },
    {
      id: 'adjusted_by',
      header: 'Adjusted By',
      cell: (row: InventoryAdjustment) => {
        if (!row.adjusted_by) return <span className='font-medium'>—</span>

        if (typeof row.adjusted_by === 'string') {
          return <span className='font-medium'>{row.adjusted_by}</span>
        }

        const name = `${(row.adjusted_by as any).first_name ?? ''} ${(row.adjusted_by as any).last_name ?? ''}`.trim()

        return <span className='font-medium'>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'created_at',
      header: 'Date',
      cell: (row: InventoryAdjustment) => (
        <span className='font-medium'>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</span>
      ),
      sortable: true
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-end w-full'>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={() => setIsModalOpen(true)}
      >
        <PlusIcon className='w-4 h-4' />
        Add Adjustment
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as InventoryAdjustment[]) || [],
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        columns={columns}
        customFilters={customFilters}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No adjustments found'
      />

      <AdjustInventoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
        inventory={inventory}
        product={product}
      />
    </>
  )
}

export default InventoryAdjustmentSection
