'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { DocumentIcon, UserIcon, ExcelIcon } from '@/public/icons'
import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
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
  ServiceType,
  Staff,
  WorkOrder,
  WorkOrderSummary as Summary
} from '@/types'
import { getInitialFilters } from '@/utils/utility'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'

import EditWorkOrderModal from './EditWorkOrderModal'
import CompletionCertificatesModal from './CompletionCertificatesModal'
import WorkOrderDocuments from './documents/WorkOrderDocuments'
import InvoiceJobImages from '../invoices/job-images/InvoiceJobImages'
import { getSharedWorkOrderColumns } from './sharedWorkOrderColumns'
import WorkOrderSummary from './WorkOrderSummary'
import TableSearch from '@/components/erp/common/TableSearch'

const WorkOrders: React.FC<{
  workOrderTypes: EstimateType[]
  serviceTypes: ServiceType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  workOrderSummary: Summary
  initialData?: DataTableApiResponse<WorkOrder> | null
  permissions?: {
    canManageEstimate: boolean
    canManageProposal: boolean
    canEditProposal: boolean
    canManageInvoice: boolean
    canEditInvoice: boolean
    canEditWorkOrder: boolean
    canDeleteWorkOrder: boolean
  }
}> = ({
  workOrderTypes,
  serviceTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations,
  workOrderSummary,
  initialData,
  permissions
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<WorkOrder> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')

  const filterOptions = useMemo(() => {
    const f = getInitialFilters(searchParams)

    delete f['wo_id']

    return f
  }, [searchParams])

  const setFilterOptions = (updater: any) => {
    const currentFilters = filterOptions
    const nextFilters = typeof updater === 'function' ? updater(currentFilters) : updater

    const params = new URLSearchParams()

    Object.keys(nextFilters).forEach(key => {
      if (nextFilters[key] !== null && nextFilters[key] !== undefined && nextFilters[key] !== '') {
        params.set(key, String(nextFilters[key]))
      }
    })

    const woId = searchParams.get('wo_id')

    if (woId) params.set('wo_id', woId)

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    setIsLoading(true)
    router.push(newUrl, { scroll: false })
  }

  const [activeTab, setActiveTab] = useState<string>('work-orders')
  const [selectedWorkOrderForTab, setSelectedWorkOrderForTab] = useState<WorkOrder | null>(null)

  // Edit work order info modal (standalone)
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState<boolean>(false)
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  // Completion certificates modal
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false)
  const [certModalWorkOrder, setCertModalWorkOrder] = useState<WorkOrder | null>(null)

  // Permissions
  const canManageEstimate = permissions?.canManageEstimate ?? false
  const canManageProposal = permissions?.canManageProposal ?? false
  const canEditProposal = permissions?.canEditProposal ?? false
  const canManageInvoice = permissions?.canManageInvoice ?? false
  const canEditInvoice = permissions?.canEditInvoice ?? false
  const canEditWorkOrder = permissions?.canEditWorkOrder ?? false
  const canDeleteWorkOrder = permissions?.canDeleteWorkOrder ?? false

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Work Orders'))
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setFilterOptions((prev: any) => {
          const newOptions = { ...prev }

          if (val && val.trim() !== '') {
            newOptions.search = val
          } else {
            delete newOptions.search
          }

          if (newOptions.page) {
            delete newOptions.page
          }

          return newOptions
        })
      }, 500),
    []
  )

  const onSearchChange = (value: string) => {
    setSearchValue(value)
    debouncedSearch(value)
  }

  const handleOpenEditModal = (id: string) => {
    router.push(`/erp/work-orders/${id}`)
  }

  const handleWorkOrderClose = () => {
    setIsWorkOrderModalOpen(false)
    setSelectedWorkOrderId(null)
    setSelectedWorkOrder(null)
  }

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await WorkOrderService.destroy(id)
        .then(() => {
          toast.success('Work order deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete work order')
        })
    } catch {
      toast.error('Something went wrong while deleting the work order!')
    }
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting work orders...`)
      const blob = await WorkOrderService.exportWorkOrders(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `work-orders-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Work orders exported successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    }
  }

  const sharedColumns = getSharedWorkOrderColumns(row => handleOpenEditModal(row.id))

  const columns: Column[] = [
    sharedColumns[0],
    {
      id: 'actions',
      header: 'Action',
      cell: (row: WorkOrder) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditWorkOrder || canDeleteWorkOrder) && (
            <ThreeDotButton
              buttons={[
                canEditWorkOrder && (
                  <EditButton
                    key='edit'
                    tooltip='Edit Work Order'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeleteWorkOrder && (
                  <DeleteButton
                    key='delete'
                    tooltip='Delete Work Order'
                    variant='text'
                    onClick={() => handleDeleteWorkOrder(row.id)}
                  />
                ),
                row.estimate_id && row.proposal_id && canManageEstimate && canManageProposal && canEditProposal && (
                  <Button
                    key='view-estimate'
                    className='w-full'
                    variant='ghost'
                    onClick={() =>
                      window.open(`/erp/estimates/${row.estimate_id}/proposals/${row.proposal_id}?mode=view`, '_blank')
                    }
                  >
                    View Original Proposal
                  </Button>
                ),
                row.invoice_id && canManageInvoice && canEditInvoice && (
                  <Button
                    key='view-invoice'
                    className='w-full'
                    variant='ghost'
                    onClick={() => window.open(`/erp/invoices/${row.invoice_id}`, '_blank')}
                  >
                    View Invoice
                  </Button>
                ),
                row.completion_certificates && row.completion_certificates.length > 0 && (
                  <Button
                    key='view-certs'
                    className='w-full'
                    variant='ghost'
                    onClick={() => {
                      setCertModalWorkOrder(row)
                      setIsCertModalOpen(true)
                    }}
                  >
                    Completion Certificates
                  </Button>
                )
              ]}
            />
          )}
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    },
    ...sharedColumns.slice(1)
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
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7 gap-1.5'
          onClick={handleExport}
        >
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>
        <TableSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Work Order Summary Cards */}
      <WorkOrderSummary workOrderSummary={workOrderSummary} />
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
          ...(canManageInvoice
            ? [
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
              ]
            : [])
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

      {/* Edit Work Order info modal */}
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
        onSuccess={() => router.refresh()}
      />

      {/* Completion Certificates */}
      {certModalWorkOrder && (
        <CompletionCertificatesModal
          open={isCertModalOpen}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setIsCertModalOpen(false)
              setCertModalWorkOrder(null)
            }
          }}
          certificates={certModalWorkOrder.completion_certificates ?? []}
        />
      )}
    </>
  )
}

export default WorkOrders
