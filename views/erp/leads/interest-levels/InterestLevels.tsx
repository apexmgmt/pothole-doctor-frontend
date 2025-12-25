'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, InterestLevel } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import InterestLevelService from '@/services/api/interest_levels.service'
import CreateOrEditInterestLevelModal from './CreateOrEditInterestLevelModal'

const InterestLevels: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedInterestLevelId, setSelectedInterestLevelId] = useState<string | null>(null)
  const [selectedInterestLevel, setSelectedInterestLevel] = useState<InterestLevel | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

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
      InterestLevelService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching interest levels:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching interest levels:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Interest Levels'))
  }, [filterOptions])

  // Transform API data to match table format
  const interestLevelsData = apiResponse?.data
    ? apiResponse.data.map((interestLevel: InterestLevel, index: number) => {
        return {
          id: interestLevel.id,
          index: (apiResponse?.from || 1) + index,
          name: interestLevel.name
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedInterestLevelId(null)
    setSelectedInterestLevel(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedInterestLevelId(id)

    // Fetch interest level details
    try {
      const response = await InterestLevelService.show(id)

      setSelectedInterestLevel(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch interest level details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedInterestLevelId(null)
    setSelectedInterestLevel(null)
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
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <EditButton
                tooltip='Edit Interest Level Information'
                onClick={() => handleOpenEditModal(row.id)}
                variant='text'
              />,
              <DeleteButton
                tooltip='Delete Interest Level'
                variant='text'
                onClick={() => handleDeleteInterestLevel(row.id)}
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteInterestLevel = async (id: string) => {
    try {
      InterestLevelService.destroy(id)
        .then(response => {
          toast.success('Interest level deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete interest level')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the interest level!')
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
        Add Interest Level
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Interest Levels' noTabs={true}>
        <CommonTable
          data={{
            data: interestLevelsData,
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
          emptyMessage='No interest level found'
        />
      </CommonLayout>

      <CreateOrEditInterestLevelModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        interestLevelId={selectedInterestLevelId || undefined}
        interestLevelDetails={selectedInterestLevel || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default InterestLevels
