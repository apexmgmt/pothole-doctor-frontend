'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, LaborCost, LaborCostsProps, ServiceType, Unit } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters } from '@/utils/utility'
import LaborCostService from '@/services/api/labor_costs.service'
import CreateOrEditLaborCostModal from './CreateOrEditLaborCostModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/utils/currency'
import TableSearch from '@/components/erp/common/TableSearch'
import CustomFormField from '@/components/form/CustomFormField'

type Permissions = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

const LaborCosts: React.FC<{
  serviceTypes: ServiceType[]
  units: Unit[]
  isFromModal?: boolean
  selectedRows?: LaborCost[]
  setSelectedRows?: React.Dispatch<React.SetStateAction<LaborCost[]>>
  initialData?: DataTableApiResponse<LaborCost> | null
  permissions?: Permissions
}> = ({
  serviceTypes,
  units,
  isFromModal = false,
  selectedRows,
  setSelectedRows,
  initialData,
  permissions: {
    canCreate: canCreateLaborCost = false,
    canEdit: canEditLaborCost = false,
    canDelete: canDeleteLaborCost = false
  } = {}
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<LaborCost> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedLaborCostId, setSelectedLaborCostId] = useState<string | null>(null)
  const [selectedLaborCost, setSelectedLaborCost] = useState<LaborCost | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const filterOptions = useMemo(() => {
    return getInitialFilters(searchParams)
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

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    setIsLoading(true)
    router.push(newUrl, { scroll: false })
  }

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    dispatch(setPageTitle('Labor Costs'))
  }, [dispatch])

  // Debounced search update
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
    router.refresh()
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
      cell: (row: LaborCost) => <span>{row?.service_type?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'name',
      header: 'Labor Name',
      cell: (row: LaborCost) => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: LaborCost) => <span>{row.description}</span>,
      sortable: true
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: (row: LaborCost) => <span>{formatCurrency(row.cost)}</span>,
      sortable: true
    },
    {
      id: 'margin',
      header: 'Margin',
      cell: (row: LaborCost) => <span>{row.margin}%</span>,
      sortable: true
    },
    {
      id: 'price',
      header: 'Labor Price',
      cell: (row: LaborCost) => <span>{formatCurrency(row.price)}</span>,
      sortable: true
    },
    {
      id: 'unit',
      header: 'Per',
      cell: (row: LaborCost) => <span>{row?.unit?.name || ''}</span>,
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
          router.refresh()
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
    <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2.5'>
      <div className='flex-1 flex flex-col md:flex-row md:items-center gap-2'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full md:max-w-160'>
          {/* Global search filter */}
          <TableSearch
            name='product-search'
            label='Search'
            value={searchValue}
            onChange={onSearchChange}
            placeholder='Search...'
          />

          {/* Service type filter */}
          <CustomFormField
            type='select'
            name='service-type-filter'
            label='Service Type'
            placeholder='All'
            value={filterOptions.service_type_id || 'all'}
            onChange={v => handleServiceTypeChange(v as string)}
            selectOptions={[
              { label: 'All', value: 'all' },
              ...(serviceTypes.map(st => ({ label: st.name, value: st.id })) || [])
            ]}
          />
        </div>

        {hasActiveFilters() && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleClearFilters}
            className='text-gray hover:text-light mt-5 h-7'
          >
            Clear
          </Button>
        )}
      </div>

      {canCreateLaborCost && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 mt-5 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span>Add Labor Cost</span>
        </Button>
      )}
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
