import { useEffect, useState } from 'react'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, DataTableApiResponse, VendorSalesman } from '@/types'

import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import VendorSalesmanService from '@/services/api/vendors/vendor-salesman.service'
import CreateOrEditSalesmanModal from './CreateOrEditSalesmanModal'

const VendorSalesmen = ({ vendorId }: { vendorId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string | null>(null)
  const [selectedSalesman, setSelectedSalesman] = useState<VendorSalesman | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: vendorId })

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        // Remove search if empty, otherwise set it
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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      VendorSalesmanService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching salesmen')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching salesmen')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

  // Transform API data to match table format
  const salesmanData = apiResponse?.data
    ? apiResponse.data.map((salesman: VendorSalesman, index: number) => {
        return {
          id: salesman.id,
          index: (apiResponse?.from || 1) + index,
          name: salesman.name,
          email: salesman.email,
          phone: salesman.phone,
          ext: salesman.ext,
          comment: salesman.comment,
          created_at: salesman.created_at,
          updated_at: salesman.updated_at
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedSalesmanId(null)
    setSelectedSalesman(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedSalesmanId(id)

    // Fetch contact type details
    try {
      const response = await VendorSalesmanService.show(id)

      setSelectedSalesman(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch salesman details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedSalesmanId(null)
    setSelectedSalesman(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'ext',
      header: 'Ext',
      cell: row => <span className='font-medium'>{row.ext}</span>,
      sortable: true
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: row => <span className='font-medium'>{row.comment}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton tooltip='Edit Salesman' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
            <DeleteButton tooltip='Delete Salesman' variant='text' onClick={() => handleDeleteSalesman(row.id)} />
          ]}
        />
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({ searchable_id: vendorId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const handleDeleteSalesman = async (id: string) => {
    try {
      await VendorSalesmanService.destroy(id)
        .then(response => {
          toast.success('Salesman deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete salesman')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the salesman!')
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
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
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        <span className='hidden min-[480px]:block'>Add Salesman</span>
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: salesmanData,
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
        emptyMessage='No salesman found'
      />

      <CreateOrEditSalesmanModal
        vendorId={vendorId}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        salesmanId={selectedSalesmanId || undefined}
        salesmanDetails={selectedSalesman || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default VendorSalesmen
