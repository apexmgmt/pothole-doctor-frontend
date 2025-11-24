'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, Commission, CommissionsParams, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CommissionService from '@/services/api/settings/commissions.service'

const Commissions: React.FC<CommissionsParams> = ({ commissionTypes, commissionFilters, commissionBases }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
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
      CommissionService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching commissions:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching commissions:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Commissions'))
  }, [filterOptions])

  // Transform API data to match table format
  const commissionsData = apiResponse?.data
    ? apiResponse.data.map((commission: any, index: number) => {
        const typeObj = commissionTypes?.find(t => t.slug === commission?.commission_type)
        const filterObj = commissionFilters?.find(f => f.slug === commission?.filter_type)
        const baseObj = commissionBases?.find(b => b.slug === commission?.based_on)

        return {
          id: commission.id,
          index: (apiResponse?.from || 1) + index,
          commission_type: typeObj ? typeObj.name : commission?.commission_type,
          based_on: baseObj ? baseObj.name : commission?.based_on,
          per: commission?.per,
          filter_type_value: filterObj ? filterObj.type : commission?.filter_type,
          filter_type: commission?.filter_type,
          amount: commission?.amount || 0,
          min_amount: commission?.min_amount || 0,
          max_amount: commission?.max_amount || 0,
          commission_percent: commission?.commission_percent,
          filter_percent: commission?.filter_percent
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedCommissionId(null)
    setSelectedCommission(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedCommissionId(id)

    // Fetch payment term details
    try {
      const response = await CommissionService.show(id)
      setSelectedCommission(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch commission details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCommissionId(null)
    setSelectedCommission(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'commission_type',
      header: 'Commission Name',
      cell: row => <span className='font-medium'>{row.commission_type}</span>,
      sortable: true
    },
    {
      id: 'based_on',
      header: 'Based On',
      cell: row => <span className='font-medium'>{row.based_on}</span>,
      sortable: true
    },
    {
      id: 'per',
      header: 'Commission Per',
      cell: row => <span className='font-medium'>{row.per}</span>,
      sortable: true
    },
    {
      id: 'filter_type_value',
      header: 'Selection',
      cell: row => <span className='font-medium'>{row.filter_type_value}</span>,
      sortable: false
    },
    {
      id: 'values',
      header: 'Values',
      cell: row => {
        switch (row.filter_type) {
          case 'between':
            return (
              <span className='font-medium'>
                {row.filter_percent ? '' : '$'}{row.min_amount}{row.filter_percent ? '%' : ''} - {row.filter_percent ? '' : '$'}{row.max_amount}{row.filter_percent ? '%' : ''}
              </span>
            )
          case 'greater-than':
            return <span className='font-medium'>{row.filter_percent ? '' : '$'}{row.min_amount}{row.filter_percent ? '%' : ''}</span>
          case 'less-than':
            return <span className='font-medium'>{row.filter_percent ? '' : '$'}{row.max_amount}{row.filter_percent ? '%' : ''}</span>
          case 'same-as-store':
            return <span className='font-medium'>0</span>
          default:
            return <span className='font-medium'>0</span>
        }
      },
      sortable: false
    },
    {
      id: 'amount',
      header: 'Commission Value',
      cell: row => <span className='font-medium'>{row.commission_percent ? '' : '$'}{row.amount}{row.commission_percent ? '%' : ''}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {/* <EditButton
            tooltip='Edit Commission Information'
            onClick={() => handleOpenEditModal(row.id)}
            variant='icon'
          /> */}
          <DeleteButton tooltip='Delete Commission' variant='icon' onClick={() => handleDeleteCommission(row.id)} />
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

  const handleDeleteCommission = async (id: string) => {
    try {
      CommissionService.destroy(id)
        .then(response => {
          toast.success('Commission deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete commission')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the commission!')
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
      {/* <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Commission
      </Button> */}
    </div>
  )

  return (
    <>
      <CommonLayout title='Commissions' noTabs={true}>
        <CommonTable
          data={{
            data: commissionsData,
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
          emptyMessage='No commission found'
        />
      </CommonLayout>

      {/* <CreateOrEditCommissionModal
        mode={modalMode}
        open={isModalOpen}
        commissionTypes={commissionTypes}
        commissionFilters={commissionFilters}
        commissionBases={commissionBases}
        onOpenChange={handleModalClose}
        commissionId={selectedCommissionId || undefined}
        commissionDetails={selectedCommission || undefined}
        onSuccess={handleSuccess}
      /> */}
    </>
  )
}

export default Commissions
