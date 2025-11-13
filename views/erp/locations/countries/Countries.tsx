'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import CountryService from '@/services/api/locations/country.service'
import CreateOrEditCountryModal from './CreateOrEditCountryModal'
import { Country } from '@/types'

const Countries: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // Initialize filterOptions from URL params
  const getInitialFilters = () => {
    const filters: any = {}
    searchParams.forEach((value, key) => {
      // Convert numeric values
      if (key === 'page' || key === 'per_page') {
        filters[key] = parseInt(value)
      } else {
        filters[key] = value
      }
    })

    return filters
  }

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters())

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

  // Update URL when filters change
  const updateURL = (filters: any) => {
    const params = new URLSearchParams()

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.set(key, String(filters[key]))
      }
    })

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    router.push(newUrl, { scroll: false })
  }

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      CountryService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching countries:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching countries:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage Countries'))
  }, [filterOptions])

  // Transform API data to match table format
  const countriesData = apiResponse?.data
    ? apiResponse.data.map((country: any, index: number) => ({
        id: country.id,
        index: (apiResponse?.from || 1) + index,
        name: country.name,
        code: country.code
      }))
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedCountryId(null)
    setSelectedCountry(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedCountryId(id)

    // Fetch country details
    try {
      const response = await CountryService.show(id)
      setSelectedCountry(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch country details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCountryId(null)
    setSelectedCountry(null)
  }

  const handleSuccess = () => {
    fetchData()
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
      id: 'code',
      header: 'Code',
      cell: row => <span className='font-medium'>{row.code}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Country Information' onClick={() => handleOpenEditModal(row.id)} variant='icon' />
          <DeleteButton tooltip='Delete Country' variant='icon' onClick={() => handleDeleteCountry(row.id)} />
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
    setIsFilterDrawerOpen(false)
  }

  const handleDeleteCountry = async (id: string) => {
    try {
      CountryService.destroy(id)
        .then(response => {
          toast.success('Country deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete country')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the country!')
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')
    return filterKeys.length > 0
  }

  // Custom filters component
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Country
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Countries' noTabs={true}>
        <CommonTable
          data={{
            data: countriesData,
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
          emptyMessage='No country found'
        />
      </CommonLayout>

      <CreateOrEditCountryModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        countryId={selectedCountryId || undefined}
        countryDetails={selectedCountry || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Countries
