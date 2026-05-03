'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  BusinessLocation,
  Client,
  Column,
  DataTableApiResponse,
  Estimate,
  EstimateType,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { formatDate } from '@/utils/date'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ClientService from '@/services/api/clients/clients.service'
import EstimateService from '@/services/api/estimates/estimates.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import CreateOrEditEstimateModal from '@/views/erp/estimates/CreateOrEditEstimateModal'

const ClientEstimates = ({ clientId }: { clientId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, client_id: clientId })
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)

  // Modal form data — loaded once on first use
  const modalDataLoaded = useRef(false)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [estimateTypes, setEstimateTypes] = useState<EstimateType[]>([])
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
      EstimateService.index({ ...filterOptions, client_id: clientId })
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching estimates')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching estimates!')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const loadModalData = async () => {
    if (modalDataLoaded.current) return

    try {
      const [serviceTypesRes, estimateTypesRes, clientsRes, staffsRes, paymentTermsRes, businessLocationsRes] =
        await Promise.allSettled([
          ServiceTypeService.getAll(),
          EstimateTypeService.getAll(),
          ClientService.getAll('customer'),
          StaffService.getAll(),
          PaymentTermsService.getAllPaymentTerms(),
          BusinessLocationService.getAll()
        ])

      if (serviceTypesRes.status === 'fulfilled') setServiceTypes(serviceTypesRes.value.data || [])
      if (estimateTypesRes.status === 'fulfilled') setEstimateTypes(estimateTypesRes.value.data || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || [])
      if (staffsRes.status === 'fulfilled') setStaffs(staffsRes.value.data || [])
      if (paymentTermsRes.status === 'fulfilled') setPaymentTerms(paymentTermsRes.value.data || [])
      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])

      modalDataLoaded.current = true
    } catch {
      toast.error('Failed to load estimate form data')
    }
  }

  const handleOpenCreateModal = async () => {
    await loadModalData()
    setModalMode('create')
    setSelectedEstimateId(null)
    setSelectedEstimate(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    await loadModalData()
    setModalMode('edit')
    setSelectedEstimateId(id)

    try {
      EstimateService.show(id)
        .then(response => {
          setSelectedEstimate(response.data)
          setIsModalOpen(true)
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch estimate details')
        })
    } catch {
      toast.error('Something went wrong while fetching the estimate details!')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEstimateId(null)
    setSelectedEstimate(null)
  }

  const handleDeleteEstimate = async (id: string) => {
    try {
      await EstimateService.destroy(id)
        .then(() => {
          toast.success('Estimate deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete estimate')
        })
    } catch {
      toast.error('Something went wrong while deleting the estimate!')
    }
  }

  const columns: Column[] = [
    {
      id: 'estimate_number',
      header: 'Estimate #',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`}>
          <span className='font-medium hover:underline'>{row.estimate_number?.toString().padStart(6, '0')}</span>
        </Link>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Estimate) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'biding_date',
      header: 'Date',
      cell: (row: Estimate) => <span className='font-medium'>{formatDate(row?.biding_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'service_type',
      header: 'Service Type',
      cell: (row: Estimate) => <span className='font-medium'>{row?.service_type?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Estimate) => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <ViewButton key='view' tooltip='View Estimate' link={`/erp/estimates/${row.id}`} variant='text' />,
              <EditButton
                key='edit'
                tooltip='Edit Estimate'
                onClick={() => handleOpenEditModal(row.id)}
                variant='text'
              />,
              <DeleteButton
                key='delete'
                tooltip='Delete Estimate'
                variant='text'
                onClick={() => handleDeleteEstimate(row.id)}
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
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1 sm:max-w-80! '>
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
      </div>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        <span className='hidden min-[480px]:block'>Add Estimate</span>
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as Estimate[]) || [],
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
        emptyMessage='No estimates found'
      />

      <CreateOrEditEstimateModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        estimateId={selectedEstimateId || undefined}
        estimateDetails={selectedEstimate || undefined}
        onSuccess={() => {
          fetchData()
          handleModalClose()
        }}
        serviceTypes={serviceTypes}
        estimateTypes={estimateTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        defaultClientId={clientId}
      />
    </>
  )
}

export default ClientEstimates
