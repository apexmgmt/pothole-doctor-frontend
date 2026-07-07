'use client'

import React, { useEffect, useMemo, useState } from 'react'
import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImageIcon, PlusIcon } from 'lucide-react'
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
  Invoice,
  InvoiceSummary as Summary,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'
import { DocumentIcon, UserIcon, ExcelIcon } from '@/public/icons'
import InvoiceService from '@/services/api/invoices/invoices.service'

import CreateOrEditInvoiceModal from './CreateOrEditInvoiceModal'
import InvoiceTasksModal from './InvoiceTasksModal'
import InvoiceAddTaskModal from './InvoiceAddTaskModal'
import InvoiceNotesModal from './InvoiceNotesModal'
import InvoiceAddNoteModal from './InvoiceAddNoteModal'
import InvoiceDocuments from './documents/InvoiceDocuments'
import InvoiceJobImages from './job-images/InvoiceJobImages'
import InvoiceSummary from './InvoiceSummary'
import { getSharedInvoiceColumns } from './sharedInvoiceColumns'
import TableSearch from '@/components/erp/common/TableSearch'

const Invoices: React.FC<{
  invoiceTypes: EstimateType[]
  serviceTypes: ServiceType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  invoicesSummary: Summary
  initialData?: DataTableApiResponse<Invoice> | null
  permissions?: { canCreate: boolean; canView: boolean; canEdit: boolean; canDelete: boolean }
}> = ({
  invoiceTypes,
  serviceTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations,
  invoicesSummary,
  initialData,
  permissions

  // units,
  // productCategories,
  // uomUnits,
  // vendors
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Invoice> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')

  const filterOptions = useMemo(() => {
    const f = getInitialFilters(searchParams)

    delete f['inv_id']

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

    const invId = searchParams.get('inv_id')

    if (invId) params.set('inv_id', invId)

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    setIsLoading(true)
    router.push(newUrl, { scroll: false })
  }

  const [activeTab, setActiveTab] = useState<string>('invoices')
  const [selectedInvoiceForTab, setSelectedInvoiceForTab] = useState<Invoice | null>(null)

  // Step 1: create/edit invoice
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false)
  const [invoiceModalMode, setInvoiceModalMode] = useState<'create' | 'edit'>('create')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Tasks modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskModalInvoiceId, setTaskModalInvoiceId] = useState<string | null>(null)
  const [taskModalClientId, setTaskModalClientId] = useState<string | null>(null)

  const [isTasksListModalOpen, setIsTasksListModalOpen] = useState(false)
  const [tasksListInvoiceId, setTasksListInvoiceId] = useState<string | null>(null)
  const [tasksListClientId, setTasksListClientId] = useState<string | null>(null)

  // Notes modal
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [addNoteInvoiceId, setAddNoteInvoiceId] = useState<string | null>(null)
  const [addNoteClientId, setAddNoteClientId] = useState<string | null>(null)

  const [isNotesListModalOpen, setIsNotesListModalOpen] = useState(false)
  const [notesListInvoiceId, setNotesListInvoiceId] = useState<string | null>(null)
  const [notesListClientId, setNotesListClientId] = useState<string | null>(null)

  // Permissions
  const canCreateInvoice = permissions?.canCreate ?? false
  const canEditInvoice = permissions?.canEdit ?? false
  const canDeleteInvoice = permissions?.canDelete ?? false

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Invoices'))
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

  const handleOpenCreateModal = () => {
    setInvoiceModalMode('create')
    setSelectedInvoiceId(null)
    setSelectedInvoice(null)
    setIsInvoiceModalOpen(true)
  }

  const handleOpenEditModal = (id: string) => {
    router.push(`/erp/invoices/${id}`)
  }

  const handleInvoiceClose = () => {
    setIsInvoiceModalOpen(false)
    setSelectedInvoiceId(null)
    setSelectedInvoice(null)
  }

  // Called after step 1 (create) — navigate to services page
  const handleCreateSuccess = (invoice: Invoice) => {
    router.push(`/erp/invoices/${invoice.id}`)
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await InvoiceService.destroy(id)
        .then(() => {
          toast.success('Invoice deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete invoice')
        })
    } catch {
      toast.error('Something went wrong while deleting the invoice!')
    }
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting invoices...`)
      const blob = await InvoiceService.exportInvoices(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `invoices-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Invoices exported successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    }
  }

  const actionColumn: Column = useMemo(
    () => ({
      id: 'actions',
      header: 'Action',
      cell: (row: Invoice) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditInvoice || canDeleteInvoice) && (
            <ThreeDotButton
              buttons={[
                <Button
                  className='w-full'
                  onClick={() => window.open(`/invoice?inid=${row.inid}&icid=${row.icid}`, '_blank')}
                  variant='ghost'
                >
                  View/Print Invoice
                </Button>,
                canEditInvoice && (
                  <Button
                    key='add-task'
                    className='w-full h-7'
                    variant='ghost'
                    onClick={() => {
                      setTaskModalInvoiceId(row.id)
                      setTaskModalClientId(row.client_id ?? null)
                      setIsTaskModalOpen(true)
                    }}
                  >
                    Add Task
                  </Button>
                ),
                <Button
                  key='view-tasks'
                  className='w-full'
                  variant='ghost'
                  onClick={() => {
                    setTasksListInvoiceId(row.id)
                    setTasksListClientId(row.client_id ?? null)
                    setIsTasksListModalOpen(true)
                  }}
                >
                  View Tasks
                </Button>,
                canEditInvoice && (
                  <Button
                    key='add-note'
                    className='w-full h-7'
                    variant='ghost'
                    onClick={() => {
                      setAddNoteInvoiceId(row.id)
                      setAddNoteClientId(row.client_id ?? null)
                      setIsAddNoteModalOpen(true)
                    }}
                  >
                    Add Note
                  </Button>
                ),
                <Button
                  key='view-notes'
                  className='w-full'
                  variant='ghost'
                  onClick={() => {
                    setNotesListInvoiceId(row.id)
                    setNotesListClientId(row.client_id ?? null)
                    setIsNotesListModalOpen(true)
                  }}
                >
                  View Notes
                </Button>,
                canEditInvoice && (
                  <EditButton
                    key='edit'
                    tooltip='Edit Invoice'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeleteInvoice && (
                  <DeleteButton
                    key='delete'
                    tooltip='Delete Invoice'
                    variant='text'
                    onClick={() => handleDeleteInvoice(row.id)}
                  />
                ),
                row.estimate_id && row.proposal_id && (
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
                row?.work_order_id && (
                  <Button
                    key='view-work-order'
                    className='w-full'
                    variant='ghost'
                    onClick={() => window.open(`/erp/work-orders/${row.work_order_id}?mode=view`, '_blank')}
                  >
                    View Work Order
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
    }),
    [canEditInvoice, canDeleteInvoice]
  )

  const columns: Column[] = useMemo(() => {
    const sharedColumns = getSharedInvoiceColumns(row => handleOpenEditModal(row.id))
    const [invoiceNumberColumn, ...remainingSharedColumns] = sharedColumns

    return [invoiceNumberColumn, actionColumn, ...remainingSharedColumns]
  }, [actionColumn])

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
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
      {canCreateInvoice && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Invoice</span>
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Invoice summary cards */}
      <InvoiceSummary invoiceSummary={invoicesSummary} />
      <CommonLayout
        title='Invoices'
        buttons={[
          {
            label: 'Invoices',
            icon: UserIcon,
            onClick: () => setActiveTab('invoices'),
            isActive: activeTab === 'invoices'
          },
          {
            label: 'Documents',
            icon: DocumentIcon,
            onClick: () => setActiveTab('documents'),
            isActive: activeTab === 'documents',
            disabled: !selectedInvoiceForTab
          },
          {
            label: 'Job Before Image',
            icon: ImageIcon,
            onClick: () => setActiveTab('job-before-image'),
            isActive: activeTab === 'job-before-image',
            disabled: !selectedInvoiceForTab
          },
          {
            label: 'Job After Image',
            icon: ImageIcon,
            onClick: () => setActiveTab('job-after-image'),
            isActive: activeTab === 'job-after-image',
            disabled: !selectedInvoiceForTab
          }
        ]}
      >
        {activeTab === 'invoices' && (
          <CommonTable
            data={{
              data: (apiResponse?.data as Invoice[]) || [],
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
            emptyMessage='No invoices found'
            handleRowSelect={(row: Invoice) => {
              setSelectedInvoiceForTab(row)
            }}
          />
        )}
        {activeTab === 'documents' && selectedInvoiceForTab && (
          <InvoiceDocuments invoiceId={selectedInvoiceForTab.id} />
        )}
        {activeTab === 'job-before-image' && selectedInvoiceForTab && (
          <InvoiceJobImages invoiceId={selectedInvoiceForTab.id} type='before' canEditInvoice={canEditInvoice} />
        )}
        {activeTab === 'job-after-image' && selectedInvoiceForTab && (
          <InvoiceJobImages invoiceId={selectedInvoiceForTab.id} type='after' canEditInvoice={canEditInvoice} />
        )}
      </CommonLayout>

      {/* Step 1: Create / Edit Invoice */}
      <CreateOrEditInvoiceModal
        mode={invoiceModalMode}
        open={isInvoiceModalOpen}
        onOpenChange={handleInvoiceClose}
        invoiceId={selectedInvoiceId || undefined}
        invoiceDetails={selectedInvoice || undefined}
        invoiceTypes={invoiceTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        onSuccess={() => router.refresh()}
        onCreateSuccess={handleCreateSuccess}
      />

      {taskModalInvoiceId && (
        <InvoiceAddTaskModal
          open={isTaskModalOpen}
          onOpenChange={open => {
            setIsTaskModalOpen(open)

            if (!open) {
              setTaskModalInvoiceId(null)
              setTaskModalClientId(null)
            }
          }}
          invoiceId={taskModalInvoiceId}
          clientId={taskModalClientId ?? undefined}
          mode='create'
        />
      )}

      {tasksListInvoiceId && (
        <InvoiceTasksModal
          open={isTasksListModalOpen}
          onOpenChange={open => {
            setIsTasksListModalOpen(open)

            if (!open) {
              setTasksListInvoiceId(null)
              setTasksListClientId(null)
            }
          }}
          invoiceId={tasksListInvoiceId}
          clientId={tasksListClientId ?? undefined}
        />
      )}

      {addNoteInvoiceId && (
        <InvoiceAddNoteModal
          open={isAddNoteModalOpen}
          onOpenChange={open => {
            setIsAddNoteModalOpen(open)

            if (!open) {
              setAddNoteInvoiceId(null)
              setAddNoteClientId(null)
            }
          }}
          invoiceId={addNoteInvoiceId}
          clientId={addNoteClientId ?? undefined}
          mode='create'
        />
      )}

      {notesListInvoiceId && (
        <InvoiceNotesModal
          open={isNotesListModalOpen}
          onOpenChange={open => {
            setIsNotesListModalOpen(open)

            if (!open) {
              setNotesListInvoiceId(null)
              setNotesListClientId(null)
            }
          }}
          invoiceId={notesListInvoiceId}
          clientId={notesListClientId ?? undefined}
        />
      )}
    </>
  )
}

export default Invoices
