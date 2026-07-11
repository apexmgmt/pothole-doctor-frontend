'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, State, Country, CountryWithStates } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'

import StateService from '@/services/api/locations/state.service'
import CreateOrEditStateModal from './CreateOrEditStateModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters } from '@/utils/utility'
import TableSearch from '@/components/erp/common/TableSearch'

const States: React.FC<{
  countriesWithStateAndCities: CountryWithStates[]
  initialData?: DataTableApiResponse<State> | null
  permissions?: { canCreateState: boolean; canViewState: boolean; canEditState: boolean; canDeleteState: boolean }
}> = ({ countriesWithStateAndCities = [], initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<State> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const canCreateState = permissions?.canCreateState ?? false
  const canEditState = permissions?.canEditState ?? false
  const canDeleteState = permissions?.canDeleteState ?? false

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

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

  useEffect(() => {
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage States'))
  }, [filterOptions])

  // Transform API data to match table format
  const statesData = apiResponse?.data
    ? apiResponse.data.map((state: any, index: number) => ({
        id: state.id,
        index: (apiResponse?.from || 1) + index,
        name: state.name,
        country: state?.country?.name
      }))
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedStateId(null)
    setSelectedState(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedStateId(id)

    // Fetch state details
    try {
      const response = await StateService.show(id)

      setSelectedState(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch state details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedStateId(null)
    setSelectedState(null)
  }

  const handleSuccess = () => {
    router.refresh()
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
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'country',
      header: 'Country',
      cell: row => <span>{row.country}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditState || canDeleteState) && (
            <ThreeDotButton
              buttons={[
                ...(canEditState
                  ? [
                      <EditButton
                        tooltip='Edit State Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteState
                  ? [<DeleteButton tooltip='Delete State' variant='text' onClick={() => handleDeleteState(row.id)} />]
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
    setIsFilterDrawerOpen(false)
  }

  const handleDeleteState = async (id: string) => {
    try {
      await StateService.destroy(id)
        .then(response => {
          toast.success('State deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete state')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the state!')
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
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateState && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add State</span>
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='States' noTabs={true}>
        <CommonTable
          data={{
            data: statesData,
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
          emptyMessage='No state found'
        />
      </CommonLayout>

      <CreateOrEditStateModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        stateId={selectedStateId || undefined}
        stateDetails={selectedState || undefined}
        countries={countriesWithStateAndCities as Country[]}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default States
