'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImageIcon, Search } from 'lucide-react'
import { DocumentIcon, UserIcon } from '@/public/icons'
import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import {
  BusinessLocation,
  Client,
  Column,
  DataTableApiResponse,
  EstimateType,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor,
  WorkOrder
} from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'

import EditWorkOrderModal from './EditWorkOrderModal'
import EditWorkOrderServicesModal from './EditWorkOrderServicesModal'
import WorkOrderDocuments from './documents/WorkOrderDocuments'
import InvoiceJobImages from '../invoices/job-images/InvoiceJobImages'

const WorkOrders: React.FC<{
  workOrderTypes: EstimateType[]
  serviceTypes: ServiceType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}> = ({
  workOrderTypes,
  serviceTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations,
  units,
  productCategories,
  uomUnits,
  vendors
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [activeTab, setActiveTab] = useState<string>('work-orders')
  const [selectedWorkOrderForTab, setSelectedWorkOrderForTab] = useState<WorkOrder | null>(null)

  // Step 1: edit work order info (opened from services modal)
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState<boolean>(false)
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  // Edit services modal (opened directly from the list)
  const [isServicesModalOpen, setIsServicesModalOpen] = useState<boolean>(false)
  const [servicesWorkOrder, setServicesWorkOrder] = useState<WorkOrder | null>(null)

  // Permissions
  const [canEditWorkOrder, setCanEditWorkOrder] = useState<boolean>(false)
  const [canDeleteWorkOrder, setCanDeleteWorkOrder] = useState<boolean>(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Update Estimate').then(result => setCanEditWorkOrder(result))
    hasPermission('Delete Estimate').then(result => setCanDeleteWorkOrder(result))
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

    try {
      WorkOrderService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    } catch {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Work Orders'))
  }, [filterOptions])

  const handleOpenEditModal = async (id: string) => {
    try {
      const response = await WorkOrderService.show(id)

      setServicesWorkOrder(response.data)
      setIsServicesModalOpen(true)
    } catch {
      toast.error('Failed to fetch work order details')
    }
  }

  const handleWorkOrderClose = () => {
    setIsWorkOrderModalOpen(false)
    setSelectedWorkOrderId(null)
    setSelectedWorkOrder(null)
  }

  const handleServicesClose = () => {
    setIsServicesModalOpen(false)
    setServicesWorkOrder(null)
    fetchData()
  }

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await WorkOrderService.destroy(id)
        .then(() => {
          toast.success('Work order deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete work order')
        })
    } catch {
      toast.error('Something went wrong while deleting the work order!')
    }
  }

  const getStatusVariant = (
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

  const columns: Column[] = [
    {
      id: 'work_order_number',
      header: 'WO #',
      cell: (row: WorkOrder) => (
        <span className='font-medium hover:underline' onClick={() => handleOpenEditModal(row.id)}>{row.work_order_number?.toString().padStart(6, '0') || 'N/A'}</span>
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
      id: 'client',
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
      id: 'status',
      header: 'Status',
      cell: (row: WorkOrder) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize'>
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row: WorkOrder) => (
        <span className='font-medium'>${row.total != null ? Number(row.total).toFixed(2) : '0.00'}</span>
      ),
      sortable: true
    },
    {
      id: 'profit',
      header: 'Profit',
      cell: (row: WorkOrder) => {
        const profit = row.profit ?? 0
        const isPositive = profit >= 0

        return (
          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${Number(profit).toFixed(2)}
          </span>
        )
      },
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: WorkOrder) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditWorkOrder || canDeleteWorkOrder) && (
            <ThreeDotButton
              buttons={[
                ...(canEditWorkOrder
                  ? [
                      <EditButton
                        key='edit'
                        tooltip='Edit Work Order'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteWorkOrder
                  ? [
                      <DeleteButton
                        key='delete'
                        tooltip='Delete Work Order'
                        variant='text'
                        onClick={() => handleDeleteWorkOrder(row.id)}
                      />
                    ]
                  : [])
              ]}
            />
          )}
        </div>
      ),
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
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        <InputGroup>
          <InputGroupInput
            placeholder='Search...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className='w-80'
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
    <>
      <CommonLayout
        title='Work Orders'
        buttons={[
          {
            label: 'Work Orders',
            icon: UserIcon,
            onClick: () => setActiveTab('work-orders'),
            isActive: activeTab === 'work-orders'
          },
          {
            label: 'Documents',
            icon: DocumentIcon,
            onClick: () => setActiveTab('documents'),
            isActive: activeTab === 'documents',
            disabled: !selectedWorkOrderForTab
          },
          {
            label: 'Job Before Image',
            icon: ImageIcon,
            onClick: () => setActiveTab('job-before-image'),
            isActive: activeTab === 'job-before-image',
            disabled: !selectedWorkOrderForTab?.invoice_id
          },
          {
            label: 'Job After Image',
            icon: ImageIcon,
            onClick: () => setActiveTab('job-after-image'),
            isActive: activeTab === 'job-after-image',
            disabled: !selectedWorkOrderForTab?.invoice_id
          }
        ]}
      >
        {activeTab === 'work-orders' && (
          <CommonTable
            data={{
              data: (apiResponse?.data as WorkOrder[]) || [],
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
            emptyMessage='No work orders found'
            handleRowSelect={(row: WorkOrder) => {
              setSelectedWorkOrderForTab(row)
            }}
          />
        )}
        {activeTab === 'documents' && selectedWorkOrderForTab && (
          <WorkOrderDocuments workOrderId={selectedWorkOrderForTab.id} />
        )}
        {activeTab === 'job-before-image' && selectedWorkOrderForTab?.invoice_id && (
          <InvoiceJobImages invoiceId={selectedWorkOrderForTab.invoice_id} type='before' />
        )}
        {activeTab === 'job-after-image' && selectedWorkOrderForTab?.invoice_id && (
          <InvoiceJobImages invoiceId={selectedWorkOrderForTab.invoice_id} type='after' />
        )}
      </CommonLayout>

      {/* Edit Work Order info — opened from inside EditWorkOrderServicesModal */}
      <EditWorkOrderModal
        open={isWorkOrderModalOpen}
        onOpenChange={handleWorkOrderClose}
        workOrderId={selectedWorkOrderId || undefined}
        workOrderDetails={selectedWorkOrder || undefined}
        workOrderTypes={workOrderTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        onSuccess={fetchData}
      />

      {/* Edit Services — opened directly from the list */}
      {servicesWorkOrder && (
        <EditWorkOrderServicesModal
          open={isServicesModalOpen}
          onOpenChange={(open: boolean) => {
            if (!open) handleServicesClose()
          }}
          workOrder={servicesWorkOrder}
          serviceTypes={serviceTypes}
          units={units}
          productCategories={productCategories}
          uomUnits={uomUnits}
          vendors={vendors}
          workOrderTypes={workOrderTypes}
          clients={clients}
          staffs={staffs}
          paymentTerms={paymentTerms}
          businessLocations={businessLocations}
          onSuccess={() => fetchData()}
        />
      )}
    </>
  )
}

export default WorkOrders
