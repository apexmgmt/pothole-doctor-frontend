'use client'

import React, { useEffect, useState } from 'react'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import { Column, DataTableApiResponse, PurchaseOrder } from '@/types'
import { formatDate } from '@/utils/date'

interface WarehousePurchaseOrdersProps {
  warehouseId: string
}

const WarehousePurchaseOrders: React.FC<WarehousePurchaseOrdersProps> = ({ warehouseId }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({ warehouse_id: warehouseId })

  useEffect(() => {
    setFilterOptions((prev: any) => ({
      ...prev,
      warehouse_id: warehouseId,
      page: 1
    }))
  }, [warehouseId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev, warehouse_id: warehouseId }

        if (searchValue && searchValue.trim() !== '') {
          newOptions.search = searchValue
        } else {
          delete newOptions.search
        }

        if (newOptions.page) {
          delete newOptions.page
        }

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, warehouseId])

  const fetchData = async () => {
    setIsLoading(true)

    PurchaseOrderService.index(filterOptions)
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch purchase orders')
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (status?.toLowerCase()) {
      case 'ordered':
        return 'info'
      case 'received':
        return 'success'
      case 'partial_received':
        return 'warning'
      case 'moved_to_inventory':
        return 'success'
      case 'pending':
        return 'pending'
      case 'new':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const columns: Column[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row: PurchaseOrder) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize'>
          {row.status?.replace(/_/g, ' ') ?? '-'}
        </Badge>
      ),
      sortable: false
    },
    {
      id: 'purchase_order_number',
      header: 'PO #',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>PO-{row.purchase_order_number?.toString().padStart(6, '0') ?? 'N/A'}</span>
      ),
      sortable: true
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.vendor?.first_name ?? '-'}</span>,
      sortable: false
    },
    {
      id: 'carrier',
      header: 'Carrier',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.courier?.name ?? '-'}</span>,
      sortable: false
    },
    {
      id: 'reference_number',
      header: 'Ref. Number',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.reference_number || '-'}</span>,
      sortable: false
    },
    {
      id: 'ordered_date',
      header: 'Ordered Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate((row as any).ordered_date || '') || '-'}</span>
      ),
      sortable: false
    },
    {
      id: 'arrival_date',
      header: 'Arrival Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate(row.actual_arrival_date || row.est_arrival_date || '') || '-'}</span>
      ),
      sortable: true
    }
  ]

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(
      key => key !== 'page' && key !== 'per_page' && key !== 'warehouse_id'
    )

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setFilterOptions({ warehouse_id: warehouseId })
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <InputGroup>
          <InputGroupInput
            placeholder='Search purchase orders...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className='lg:w-80 min-w-0'
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
            Clear
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <CommonTable
      data={{
        data: (apiResponse?.data as PurchaseOrder[]) || [],
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
      emptyMessage='No purchase orders found for the selected warehouse'
    />
  )
}

export default WarehousePurchaseOrders
