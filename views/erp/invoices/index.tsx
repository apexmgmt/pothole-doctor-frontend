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
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import {
  BusinessLocation,
  Client,
  Column,
  DataTableApiResponse,
  EstimateType,
  Invoice,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor
} from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'
import { DocumentIcon, UserIcon } from '@/public/icons'
import InvoiceService from '@/services/api/invoices/invoices.service'

import CreateOrEditInvoiceModal from './CreateOrEditInvoiceModal'
import AddInvoiceServicesModal from './AddInvoiceServicesModal'
import InvoiceTasksModal from './InvoiceTasksModal'
import InvoiceAddTaskModal from './InvoiceAddTaskModal'
import InvoiceNotesModal from './InvoiceNotesModal'
import InvoiceAddNoteModal from './InvoiceAddNoteModal'
import InvoiceDocuments from './documents/InvoiceDocuments'

const Invoices: React.FC<{
  invoiceTypes: EstimateType[]
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
  invoiceTypes,
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
  const [activeTab, setActiveTab] = useState<string>('invoices')
  const [selectedInvoiceForTab, setSelectedInvoiceForTab] = useState<Invoice | null>(null)

  // Step 1: create/edit invoice
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false)
  const [invoiceModalMode, setInvoiceModalMode] = useState<'create' | 'edit'>('create')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Step 2: add/edit services (opens after both create and edit)
  const [isServicesModalOpen, setIsServicesModalOpen] = useState<boolean>(false)
  const [servicesInvoice, setServicesInvoice] = useState<Invoice | null>(null)

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
  const [canCreateInvoice, setCanCreateInvoice] = useState<boolean>(false)
  const [canEditInvoice, setCanEditInvoice] = useState<boolean>(false)
  const [canDeleteInvoice, setCanDeleteInvoice] = useState<boolean>(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Estimate').then(result => setCanCreateInvoice(result))
    hasPermission('Update Estimate').then(result => setCanEditInvoice(result))
    hasPermission('Delete Estimate').then(result => setCanDeleteInvoice(result))
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
      InvoiceService.index(filterOptions)
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
    dispatch(setPageTitle('Manage Invoices'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setInvoiceModalMode('create')
    setSelectedInvoiceId(null)
    setSelectedInvoice(null)
    setIsInvoiceModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    try {
      const response = await InvoiceService.show(id)

      setServicesInvoice(response.data)
      setIsServicesModalOpen(true)
    } catch {
      toast.error('Failed to fetch invoice details')
    }
  }

  const handleInvoiceClose = () => {
    setIsInvoiceModalOpen(false)
    setSelectedInvoiceId(null)
    setSelectedInvoice(null)
  }

  // Called after step 1 (create or edit) — auto-open step 2
  const handleCreateSuccess = (invoice: Invoice) => {
    setServicesInvoice(invoice)
    setIsServicesModalOpen(true)
  }

  const handleServicesClose = () => {
    setIsServicesModalOpen(false)
    setServicesInvoice(null)
    fetchData()
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await InvoiceService.destroy(id)
        .then(() => {
          toast.success('Invoice deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete invoice')
        })
    } catch {
      toast.error('Something went wrong while deleting the invoice!')
    }
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'overdue':
        return 'destructive'
      case 'sent':
      case 'sent to customer':
        return 'warning'
      case 'viewed':
      case 'viewed by customer':
        return 'info'
      case 'void':
        return 'destructive'
      case 'new':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const columns: Column[] = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      cell: (row: Invoice) => (
        <span className='font-medium hover:underline cursor-pointer' onClick={() => handleOpenEditModal(row.id)}>
          {row.invoice_number?.toString().padStart(6, '0') || 'N/A'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Invoice) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Invoice) => <span className='font-medium'>{row?.client?.company?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Invoice) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: false
    },
    {
      id: 'issue_date',
      header: 'Issue Date',
      cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.issue_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'due_date',
      header: 'Due Date',
      cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.due_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Invoice) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize'>
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row: Invoice) => (
        <span className='font-medium'>${row.total != null ? Number(row.total).toFixed(2) : '0.00'}</span>
      ),
      sortable: true
    },
    {
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
                <Button
                  key='add-task'
                  className='w-full'
                  variant='ghost'
                  onClick={() => {
                    setTaskModalInvoiceId(row.id)
                    setTaskModalClientId(row.client_id ?? null)
                    setIsTaskModalOpen(true)
                  }}
                >
                  Add Task
                </Button>,
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
                <Button
                  key='add-note'
                  className='w-full'
                  variant='ghost'
                  onClick={() => {
                    setAddNoteInvoiceId(row.id)
                    setAddNoteClientId(row.client_id ?? null)
                    setIsAddNoteModalOpen(true)
                  }}
                >
                  Add Note
                </Button>,
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
                )
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
      {canCreateInvoice && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Invoice
        </Button>
      )}
    </div>
  )

  return (
    <>
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
        onSuccess={fetchData}
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

      {/* Step 2: Add / Edit Services (opens after create or edit) */}
      {servicesInvoice && (
        <AddInvoiceServicesModal
          open={isServicesModalOpen}
          onOpenChange={open => {
            if (!open) handleServicesClose()
          }}
          invoice={servicesInvoice}
          serviceTypes={serviceTypes}
          units={units}
          productCategories={productCategories}
          uomUnits={uomUnits}
          vendors={vendors}
          invoiceTypes={invoiceTypes}
          clients={clients}
          staffs={staffs}
          paymentTerms={paymentTerms}
          businessLocations={businessLocations}
          onSuccess={handleServicesClose}
        />
      )}
    </>
  )
}

export default Invoices
