'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, LaborCost, LaborCostsProps, ServiceType, Unit } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import LaborCostService from '@/services/api/labor_costs.service'
import CreateOrEditLaborCostModal from './CreateOrEditLaborCostModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { hasPermission } from '@/utils/role-permission'

const LaborCosts: React.FC<{
  serviceTypes: ServiceType[]
  units: Unit[]
  isFromModal?: boolean
  selectedRows?: LaborCost[]
  setSelectedRows?: React.Dispatch<React.SetStateAction<LaborCost[]>>
}> = ({ serviceTypes, units, isFromModal = false, selectedRows, setSelectedRows }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedLaborCostId, setSelectedLaborCostId] = useState<string | null>(null)
  const [selectedLaborCost, setSelectedLaborCost] = useState<LaborCost | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateLaborCost, setCanCreateLaborCost] = useState<boolean>(false)
  const [canEditLaborCost, setCanEditLaborCost] = useState<boolean>(false)
  const [canDeleteLaborCost, setCanDeleteLaborCost] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Labor Cost').then(result => setCanCreateLaborCost(result))
    hasPermission('Update Labor Cost').then(result => setCanEditLaborCost(result))
    hasPermission('Delete Labor Cost').then(result => setCanDeleteLaborCost(result))
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
      LaborCostService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch labor costs')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the labor costs!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)

    // set the page title only if the view from page
    if (!isFromModal) dispatch(setPageTitle('Manage Labor Costs'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedLaborCostId(null)
    setSelectedLaborCost(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedLaborCostId(id)

    // Fetch labor cost details
    try {
      const response = await LaborCostService.show(id)

      setSelectedLaborCost(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch labor cost details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedLaborCostId(null)
    setSelectedLaborCost(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleServiceTypeChange = (value: string) => {
    setFilterOptions((prev: any) => {
      const newOptions = { ...prev }

      if (value === 'all') {
        delete newOptions.service_type_id
      } else {
        newOptions.service_type_id = value
      }

      // Optionally reset page on filter change
      if (newOptions.page) delete newOptions.page

      return newOptions
    })
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    ...(isFromModal
      ? [
          {
            id: 'select',
            header: '',
            cell: (row: LaborCost) => (
              <Checkbox
                checked={selectedRows?.some((r: LaborCost) => r.id === row.id)}
                onCheckedChange={checked => {
                  setSelectedRows?.((prev: LaborCost[]) => {
                    if (checked) {
                      // Add if not already present
                      if (!prev.some(r => r.id === row.id)) return [...prev, row]

                      return prev
                    } else {
                      // Remove
                      return prev.filter(r => r.id !== row.id)
                    }
                  })
                }}
              />
            ),
            sortable: false,
            size: 16
          }
        ]
      : [
          {
            id: 'index',
            header: '#',
            cell: (row: LaborCost, rowIndex: number | undefined) => {
              // Calculate the absolute index based on pagination
              const from = apiResponse?.from || 1

              return <span className='text-gray'>{from + (rowIndex || 0)}</span>
            },
            sortable: false,
            size: 16
          }
        ]),

    {
      id: 'service_type',
      header: 'Service Type',
      cell: (row: LaborCost) => <span className='font-medium'>{row?.service_type?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'name',
      header: 'Labor Name',
      cell: (row: LaborCost) => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: LaborCost) => <span className='font-medium'>{row.description}</span>,
      sortable: true
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: (row: LaborCost) => <span className='font-medium'>{row.cost}</span>,
      sortable: true
    },
    {
      id: 'margin',
      header: 'Margin',
      cell: (row: LaborCost) => <span className='font-medium'>{row.margin}</span>,
      sortable: true
    },
    {
      id: 'price',
      header: 'Labor Price',
      cell: (row: LaborCost) => <span className='font-medium'>{row.price}</span>,
      sortable: true
    },
    {
      id: 'unit',
      header: 'Per',
      cell: (row: LaborCost) => <span className='font-medium'>{row?.unit?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: LaborCost) => (
        <>
          {(canEditLaborCost || canDeleteLaborCost) && (
            <ThreeDotButton
              buttons={[
                ...(canEditLaborCost
                  ? [
                      <EditButton
                        tooltip='Edit Labor Cost Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteLaborCost
                  ? [
                      <DeleteButton
                        tooltip='Delete Labor Cost'
                        variant='text'
                        onClick={() => handleDeleteLaborCost(row.id)}
                      />
                    ]
                  : [])
              ]}
            />
          )}
        </>
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

  const handleDeleteLaborCost = async (id: string) => {
    try {
      await LaborCostService.destroy(id)
        .then(response => {
          toast.success('Labor cost deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete labor cost')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the labor cost!')
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
      <div className='flex items-center gap-2 lg:flex-0 flex-1 sm:max-w-80! '>
        {/* Global search filter */}
        <div className='flex flex-col'>
          <label htmlFor='product-search' className='text-xs font-medium mb-1 text-muted-foreground'>
            Search
          </label>
          <InputGroup>
            <InputGroupInput
              id='product-search'
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
        {/* Service type filter */}
        <div className='flex flex-col'>
          <label htmlFor='service-type-filter' className='text-xs font-medium mb-1 text-muted-foreground'>
            Service Type
          </label>
          <Select value={filterOptions.service_type_id || 'all'} onValueChange={handleServiceTypeChange}>
            <SelectTrigger id='service-type-filter' className='w-72'>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              {serviceTypes.map(st => (
                <SelectItem key={st.id} value={st.id}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light mt-5'>
            Clear
          </Button>
        )}
      </div>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90 mt-5'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        <span className='hidden min-[480px]:block'>Add Labor Cost</span>
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Labor Costs' noTabs={true}>
        <CommonTable
          data={{
            data: apiResponse?.data || [],
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
          emptyMessage='No labor cost found'
        />
      </CommonLayout>

      <CreateOrEditLaborCostModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        serviceTypes={serviceTypes}
        units={units}
        laborCostId={selectedLaborCostId || undefined}
        laborCostDetails={selectedLaborCost || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default LaborCosts
