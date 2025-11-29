'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Unit } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CreateOrEditUnitModal from './CreateOrEditUnitModal'
import UnitService from '@/services/api/settings/units.service'

const Units: React.FC<{ group?: string | 'uom' | 'measure' }> = ({ group }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
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
      const params = { ...filterOptions, ...(group ? { group } : {}) }
      UnitService.index(params)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching units:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching units:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Units'))
  }, [filterOptions])

  // Transform API data to match table format
  const unitsData = apiResponse?.data
    ? apiResponse.data.map((unit: Unit, index: number) => {
        return {
          id: unit.id,
          index: (apiResponse?.from || 1) + index,
          name: unit.name,
          group: unit.group
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedUnitId(null)
    setSelectedUnit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedUnitId(id)

    // Fetch unit details
    try {
      const response = await UnitService.show(id)
      setSelectedUnit(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch unit details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUnitId(null)
    setSelectedUnit(null)
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
      id: 'group',
      header: 'Group',
      cell: row => <span className='font-medium capitalize'>{row.group}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Unit Information' onClick={() => handleOpenEditModal(row.id)} variant='icon' />
          <DeleteButton tooltip='Delete Unit' variant='icon' onClick={() => handleDeleteUnit(row.id)} />
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

  const handleDeleteUnit = async (id: string) => {
    try {
      UnitService.destroy(id)
        .then(response => {
          toast.success('Unit deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete unit')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the unit!')
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
        Add Unit
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title={group === 'uom' ? 'Uom Units' : 'Measure Units'} noTabs={true}>
        <CommonTable
          data={{
            data: unitsData,
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
          emptyMessage='No unit found'
        />
      </CommonLayout>

      <CreateOrEditUnitModal
        group={group}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        unitId={selectedUnitId || undefined}
        unitDetails={selectedUnit || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Units
