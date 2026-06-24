'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'
import { Column, DataTableApiResponse, Product, ProductBulkEditPayload } from '@/types'
import ProductService from '@/services/api/products/products.service'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'

interface BulkEditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  selectedIds: string[]
  type: 'inventory' | 'non_inventory'
}

export default function BulkEditProductModal({
  open,
  onOpenChange,
  onSuccess,
  selectedIds,
  type
}: BulkEditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)

  // Track changes keyed by product ID
  const [changes, setChanges] = useState<Record<string, ProductBulkEditPayload>>({})

  // Fetch data
  const fetchData = async () => {
    if (!open || selectedIds.length === 0) return

    setIsLoading(true)

    try {
      const filterOptions = {
        ids: selectedIds,
        per_page: selectedIds.length,
        page: 1
      }

      const response =
        type === 'inventory'
          ? await ProductService.index(filterOptions)
          : await NonInventoryProductService.index(filterOptions)

      setApiResponse(response.data)
      setIsLoading(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch selected products')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setChanges({}) // Reset changes when opened
      fetchData()
    } else {
      setApiResponse(null)
    }
  }, [open, selectedIds])

  const handleCostChange = (id: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value)

    setChanges(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { id }), product_cost: numValue }
    }))
  }

  const handleMarginChange = (id: string, value: string) => {
    let numValue = value === '' ? undefined : Number(value)

    if (numValue !== undefined) {
      if (numValue < 0) numValue = 0
      if (numValue > 100) numValue = 100
    }

    setChanges(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { id }), margin: numValue }
    }))
  }

  const handleStatusChange = (id: string, value: number | boolean) => {
    setChanges(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { id }), status: value }
    }))
  }

  const handleSave = async () => {
    const changesArray = Object.values(changes)

    if (changesArray.length === 0) {
      onOpenChange(false)

      return
    }

    setIsSaving(true)

    try {
      if (type === 'inventory') {
        await ProductService.bulkEdit(changesArray)
      } else {
        await NonInventoryProductService.bulkEdit(changesArray)
      }

      toast.success('Products updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to bulk edit products')
    } finally {
      setIsSaving(false)
    }
  }

  const productData = apiResponse?.data
    ? (apiResponse.data as Product[]).map((product, index) => ({
        ...product,
        index: (apiResponse?.from || 1) + index
      }))
    : []

  const ModifiedIndicator = ({ isModified }: { isModified: boolean }) => {
    if (!isModified) return null

    return <div className='absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-500 shadow-sm z-10' title='Modified' />
  }

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: any) => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (row: any) => <span>{row?.vendor?.first_name ?? ''}</span>,
      sortable: false
    },
    { id: 'sku', header: 'SKU', cell: (row: any) => <span>{row.sku}</span>, sortable: false },
    {
      id: 'name',
      header: 'Product Name',
      cell: (row: any) => <span>{row.vendor_product_name || row.private_product_name}</span>,
      sortable: false
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: any) => <span>{row.vendor_style || row.private_style}</span>,
      sortable: false
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: any) => <span>{row.vendor_color || row.private_color}</span>,
      sortable: false
    },
    {
      id: 'product_cost',
      header: 'Product Cost',
      cell: (row: any) => (
        <div className='relative inline-block w-full min-w-25'>
          <ModifiedIndicator isModified={changes[row.id]?.product_cost !== undefined} />
          <CustomFormField
            type='number'
            name={`cost_${row.id}`}
            value={changes[row.id]?.product_cost ?? row.product_cost ?? ''}
            onChange={(val: any) => handleCostChange(row.id, String(val))}
            className='w-full h-8 px-2 pl-3'
          />
        </div>
      ),
      sortable: false
    },
    {
      id: 'margin',
      header: 'Margin (%)',
      cell: (row: any) => (
        <div className='relative inline-block w-full min-w-20'>
          <ModifiedIndicator isModified={changes[row.id]?.margin !== undefined} />
          <CustomFormField
            type='number'
            name={`margin_${row.id}`}
            value={changes[row.id]?.margin ?? row.margin ?? ''}
            onChange={(val: any) => handleMarginChange(row.id, String(val))}
            className='w-full h-8 px-2 pl-3'
          />
        </div>
      ),
      sortable: false
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: any) => (
        <div className='relative inline-flex items-center justify-center w-full h-full pt-1'>
          <ModifiedIndicator isModified={changes[row.id]?.status !== undefined} />
          <CustomFormField
            type='checkbox'
            name={`status_${row.id}`}
            value={changes[row.id]?.status !== undefined ? !!changes[row.id]?.status : !!row.status}
            onChange={(val: any) => handleStatusChange(row.id, val === true ? 1 : 0)}
            className='border-accent-foreground/60!'
          />
        </div>
      ),
      sortable: false,
      headerAlign: 'center'
    }
  ]

  const actions = (
    <div className='flex items-center justify-end gap-3 w-full'>
      <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={isSaving || isLoading}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Bulk Edit Products'
      maxWidth='7xl'
      actions={actions}
      isLoading={isLoading}
    >
      <div className='space-y-4'>
        <CommonTable
          data={{
            data: productData,
            per_page: apiResponse?.per_page || 10,
            total: apiResponse?.total || 0,
            from: apiResponse?.from || 1,
            to: apiResponse?.to || 10,
            current_page: apiResponse?.current_page || 1,
            last_page: apiResponse?.last_page || 1
          }}
          columns={columns}
          isLoading={isLoading}
          emptyMessage='No products found'
          showFilters={false}
          pagination={false}
        />
      </div>
    </CommonDialog>
  )
}
