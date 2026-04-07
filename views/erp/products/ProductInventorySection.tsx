'use client'

import React, { useState, useEffect } from 'react'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product } from '@/types'
import { PurchaseOrder } from '@/types/purchase_orders'
import { Warehouse } from '@/types/warehouses'
import { BusinessLocation } from '@/types/business_location'
import InventoryService from '@/services/api/products/inventories.service'
import { Badge } from '@/components/ui/badge'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CreateOrEditInventoryModal from './CreateOrEditInventoryModal'

interface ProductInventorySectionProps {
  product: Product
  warehouses?: Warehouse[]
  businessLocations?: BusinessLocation[]
}

const ProductInventorySection: React.FC<ProductInventorySectionProps> = ({
  product,
  warehouses = [],
  businessLocations = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedInventory, setSelectedInventory] = useState<PurchaseOrder | null>(null)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filterOptions, setFilterOptions] = useState<any>({ product_id: product.id })

  const fetchInventories = async () => {
    setIsLoading(true)

    try {
      InventoryService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch inventory')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong!')
    }
  }

  useEffect(() => {
    fetchInventories()
  }, [filterOptions])

  const handleOpenCreate = () => {
    setSelectedInventory(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (row: PurchaseOrder) => {
    setSelectedInventory(row)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchInventories()
  }

  const columns: Column[] = [
    {
      id: 'active',
      header: 'Active',
      cell: (row: PurchaseOrder) => (
        <Badge variant={row.purchase_order_active ? 'default' : 'secondary'}>
          {row.purchase_order_active ? 'Yes' : 'No'}
        </Badge>
      ),
      sortable: false
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{(row.warehouse as any)?.name ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'purchase_order_number',
      header: 'PO#',
      cell: (row: PurchaseOrder) => <span className='font-medium'>PO-{row.purchase_order_number}</span>,
      sortable: true
    },
    {
      id: 'po_quantity',
      header: 'PO Quantity',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.purchase_products?.[0]?.quantity ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'lot_number',
      header: 'Lot Number',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.lot_number || '—'}</span>,
      sortable: false
    },
    {
      id: 'adjusted_quantity',
      header: 'Adj. Quantity',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{row.purchase_products?.[0]?.adjusted_quantity ?? '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'added_date',
      header: 'Date Added',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.added_date || '—'}</span>,
      sortable: true
    },
    {
      id: 'avail_quantity',
      header: 'Avail. Quantity',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.purchase_products?.[0]?.quantity ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'work_order_cost',
      header: 'WO Cost',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {row.purchase_products?.[0]?.work_order_cost != null
            ? Number(row.purchase_products[0].work_order_cost).toFixed(2)
            : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'customer_price',
      header: 'Customer Price',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {row.purchase_products?.[0]?.customer_price != null
            ? Number(row.purchase_products[0].customer_price).toFixed(2)
            : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: PurchaseOrder) => (
        <div className='flex items-center justify-center'>
          <ThreeDotButton
            buttons={[
              <EditButton key='edit' tooltip='Edit Inventory' onClick={() => handleOpenEdit(row)} variant='text' />
            ]}
          />
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-end w-full'>
      <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90' onClick={handleOpenCreate}>
        <PlusIcon className='w-4 h-4' />
        Add Inventory
      </Button>
    </div>
  )

  return (
    <>
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
        emptyMessage='No inventory records found'
      />

      <CreateOrEditInventoryModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
        product={product}
        inventoryDetails={selectedInventory}
        warehouses={warehouses}
        businessLocations={businessLocations}
      />
    </>
  )
}

export default ProductInventorySection
