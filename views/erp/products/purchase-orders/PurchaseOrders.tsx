'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import ShipmentArrivalModal from './ShipmentArrivalModal'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import {
  BusinessLocation,
  Column,
  Courier,
  DataTableApiResponse,
  ProductCategory,
  PurchaseOrder,
  ServiceType,
  Vendor,
  Warehouse
} from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters, updateURL } from '@/utils/utility'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import CreateOrEditPurchaseOrderModal from './CreateOrEditPurchaseOrderModal'

interface PurchaseOrdersProps {
  vendors: Vendor[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  couriers: Courier[]
  productCategories: ProductCategory[]
  serviceTypes: ServiceType[]
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({
  vendors = [],
  warehouses = [],
  businessLocations = [],
  couriers = [],
  productCategories = [],
  serviceTypes = []
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string | undefined>(undefined)
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState<boolean>(false)
  const [shipmentPurchaseOrderId, setShipmentPurchaseOrderId] = useState<string | undefined>(undefined)
  const [isShipmentViewOnly, setIsShipmentViewOnly] = useState<boolean>(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev }

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
  }, [searchValue])

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
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Purchase Orders'))
  }, [filterOptions])

  const handleDelete = async (id: string) => {
    try {
      await PurchaseOrderService.destroy(id)
      toast.success('Purchase order deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete purchase order')
    }
  }

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

  const getPaymentStatusVariant = (
    paymentDue: string | null
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (paymentDue) {
      case 'paid':
        return 'success'
      case 'on_arrival':
        return 'warning'
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
          {row.status?.replace(/_/g, ' ') ?? '—'}
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
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.vendor?.first_name ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'courier',
      header: 'Carrier',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{(row.courier as Courier)?.name ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {row.warehouse_type === 'warehouse'
            ? ((row.warehouse as Warehouse)?.title ?? '—')
            : ((row.warehouse as BusinessLocation)?.name ?? '—')}
        </span>
      ),
      sortable: false
    },
    {
      id: 'reference_number',
      header: 'Ref. Number',
      cell: (row: PurchaseOrder) => <span className='font-medium'>{row.reference_number || '—'}</span>,
      sortable: false
    },
    {
      id: 'est_departure_date',
      header: 'Departure Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate(row.est_departure_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'est_arrival_date',
      header: 'Arrival Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate(row.est_arrival_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'ordered_date',
      header: 'Ordered Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate((row as any).ordered_date || '') || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'received_date',
      header: 'Received Date',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate(row.actual_arrival_date || '') || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'moved_to_inventory_date',
      header: 'Moved to Inventory',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>{formatDate((row as any).moved_to_inventory_date || '') || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'total_cost',
      header: 'Total Cost',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {(row as any).total_cost != null ? Number((row as any).total_cost).toFixed(2) : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'paid_amount',
      header: 'Paid Amount',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {(row as any).paid_amount != null ? Number((row as any).paid_amount).toFixed(2) : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'balance_amount',
      header: 'Balance',
      cell: (row: PurchaseOrder) => (
        <span className='font-medium'>
          {(row as any).balance_amount != null ? Number((row as any).balance_amount).toFixed(2) : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'payment_status',
      header: 'Payment Status',
      cell: (row: PurchaseOrder) => (
        <Badge variant={getPaymentStatusVariant((row as any).payment_due)} className='capitalize'>
          {(row as any).payment_due ? (row as any).payment_due.replace(/_/g, ' ') : '—'}
        </Badge>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: PurchaseOrder) => {
        const isEditable = row.status === 'new' || row.status === 'pending'
        const canReceive = row.status !== 'received' && row.status !== 'moved_to_inventory'
        const canViewShipment = row.status === 'moved_to_inventory'

        if (!isEditable && !canReceive && !canViewShipment) return null

        const buttons: React.ReactNode[] = []

        if (canViewShipment) {
          buttons.push(
            <button
              key='view-shipment'
              type='button'
              className='w-full text-left text-sm px-2 py-1 hover:text-primary transition-colors'
              onClick={() => {
                setShipmentPurchaseOrderId(row.id)
                setIsShipmentViewOnly(true)
                setIsShipmentModalOpen(true)
              }}
            >
              View Shipment
            </button>
          )
        }

        if (canReceive) {
          buttons.push(
            <button
              key='shipment'
              type='button'
              className='w-full text-left text-sm px-2 py-1 hover:text-primary transition-colors'
              onClick={() => {
                setShipmentPurchaseOrderId(row.id)
                setIsShipmentViewOnly(false)
                setIsShipmentModalOpen(true)
              }}
            >
              Shipment Arrival
            </button>
          )
        }

        if (isEditable) {
          buttons.push(
            <EditButton
              key='edit'
              tooltip='Edit Purchase Order'
              onClick={() => {
                setModalMode('edit')
                setSelectedPurchaseOrderId(row.id)
                setIsModalOpen(true)
              }}
              variant='text'
            />,
            <DeleteButton
              key='delete'
              tooltip='Delete Purchase Order'
              variant='text'
              onClick={() => handleDelete(row.id)}
            />
          )
        }

        return (
          <div className='flex items-center justify-center gap-2'>
            <ThreeDotButton buttons={buttons} />
          </div>
        )
      },
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5 '>
      <div className='flex items-center gap-2 lg:flex-0 flex-1 '>
        <InputGroup>
          <InputGroupInput
            placeholder='Search...'
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
      <Button
        size='sm'
        onClick={() => {
          setModalMode('create')
          setSelectedPurchaseOrderId(undefined)
          setIsModalOpen(true)
        }}
      >
        <PlusIcon className='w-4 h-4 mr-1' />
        <span className='hidden min-[480px]:block'>Create Purchase Order</span>
      </Button>
    </div>
  )

  return (
    <>
      <CreateOrEditPurchaseOrderModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchData}
        purchaseOrderId={selectedPurchaseOrderId}
        vendors={vendors}
        warehouses={warehouses}
        businessLocations={businessLocations}
        couriers={couriers}
        productCategories={productCategories}
        serviceTypes={serviceTypes}
      />
      {shipmentPurchaseOrderId && (
        <ShipmentArrivalModal
          open={isShipmentModalOpen}
          onOpenChange={setIsShipmentModalOpen}
          onSuccess={fetchData}
          purchaseOrderId={shipmentPurchaseOrderId}
          warehouses={warehouses}
          businessLocations={businessLocations}
          viewOnly={isShipmentViewOnly}
        />
      )}
      <CommonLayout title='Purchase Orders' noTabs>
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
          emptyMessage='No purchase orders found'
        />
      </CommonLayout>
    </>
  )
}

export default PurchaseOrders
