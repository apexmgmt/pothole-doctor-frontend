'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  BusinessLocation,
  Client,
  Column,
  DataTableApiResponse,
  EstimateType,
  Invoice,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { formatDate } from '@/utils/date'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ClientService from '@/services/api/clients/clients.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import InvoiceService from '@/services/api/invoices/invoices.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import CreateOrEditInvoiceModal from '@/views/erp/invoices/CreateOrEditInvoiceModal'

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

const ClientInvoices = ({ clientId }: { clientId: string }) => {
  const router = useRouter()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, client_id: clientId })
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Modal form data — loaded once on first use
  const modalDataLoaded = useRef(false)
  const [invoiceTypes, setInvoiceTypes] = useState<EstimateType[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev, client_id: clientId }

        if (searchValue && searchValue.trim() !== '') {
          newOptions.search = searchValue
        } else {
          delete newOptions.search
        }

        delete newOptions.page

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      InvoiceService.index({ ...filterOptions, client_id: clientId })
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching invoices')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching invoices!')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const loadModalData = async () => {
    if (modalDataLoaded.current) return

    try {
      const [invoiceTypesRes, serviceTypesRes, clientsRes, staffsRes, paymentTermsRes, businessLocationsRes] =
        await Promise.allSettled([
          EstimateTypeService.getAll(),
          ServiceTypeService.getAll(),
          ClientService.getAll('customer'),
          StaffService.getAll(),
          PaymentTermsService.getAllPaymentTerms(),
          BusinessLocationService.getAll()
        ])

      if (invoiceTypesRes.status === 'fulfilled') setInvoiceTypes(invoiceTypesRes.value.data || [])
      if (serviceTypesRes.status === 'fulfilled') setServiceTypes(serviceTypesRes.value.data || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || [])
      if (staffsRes.status === 'fulfilled') setStaffs(staffsRes.value.data || [])
      if (paymentTermsRes.status === 'fulfilled') setPaymentTerms(paymentTermsRes.value.data || [])
      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])

      modalDataLoaded.current = true
    } catch {
      toast.error('Failed to load invoice form data')
    }
  }

  const handleOpenCreateModal = async () => {
    await loadModalData()
    setIsModalOpen(true)
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

  const columns: Column[] = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      cell: (row: Invoice) => (
        <span
          className='font-medium hover:underline cursor-pointer'
          onClick={() => router.push(`/erp/invoices/${row.id}`)}
        >
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
          <ThreeDotButton
            buttons={[
              <EditButton
                key='edit'
                tooltip='View / Edit Invoice'
                onClick={() => router.push(`/erp/invoices/${row.id}`)}
                variant='text'
              />,
              <DeleteButton
                key='delete'
                tooltip='Delete Invoice'
                variant='text'
                onClick={() => handleDeleteInvoice(row.id)}
              />
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
    <div className='flex items-center justify-between w-full'>
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Invoice
      </Button>
    </div>
  )

  return (
    <>
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
        customFilters={<></>}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No invoices found'
      />

      <CreateOrEditInvoiceModal
        mode='create'
        open={isModalOpen}
        onOpenChange={open => setIsModalOpen(open)}
        onSuccess={() => {
          fetchData()
          setIsModalOpen(false)
        }}
        onCreateSuccess={invoice => {
          router.push(`/erp/invoices/${invoice.id}`)
        }}
        invoiceTypes={invoiceTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        defaultClientId={clientId}
      />
    </>
  )
}

export default ClientInvoices
