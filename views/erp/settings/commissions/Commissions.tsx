'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, Commission, CommissionsParams, DataTableApiResponse } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CommissionService from '@/services/api/settings/commissions.service'
import CreateOrEditCommissionModal from './CreateOrEditCommissionModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import { formatCurrency } from '@/utils/currency'
import TableSearch from '@/components/erp/common/TableSearch'

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
  const [canCreateCommission, setCanCreateCommission] = useState<boolean>(false)
  const [canEditCommission, setCanEditCommission] = useState<boolean>(false)
  const [canDeleteCommission, setCanDeleteCommission] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Commission').then(result => {
      setCanCreateCommission(result)
    })

    hasPermission('Update Commission').then(result => {
      setCanEditCommission(result)
    })

    hasPermission('Delete Commission').then(result => {
      setCanDeleteCommission(result)
    })
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
      cell: (row: Commission) => {
        const typeObj = commissionTypes?.find(t => t.slug === row?.commission_type)

        return <span>{typeObj ? typeObj.name : row?.commission_type}</span>
      },
      sortable: true
    },
    {
      id: 'based_on',
      header: 'Based On',
      cell: (row: Commission) => {
        const baseObj = commissionBases?.find(b => b.slug === row?.based_on)

        return <span>{baseObj ? baseObj.name : row?.based_on}</span>
      },
      sortable: true
    },
    {
      id: 'per',
      header: 'Commission Per',
      cell: (row: Commission) => (
        <span>{row?.per?.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()) || row?.per}</span>
      ),
      sortable: true
    },
    {
      id: 'filter_type',
      header: 'Selection',
      cell: (row: Commission) => {
        const filterObj = commissionFilters?.find(f => f.slug === row?.filter_type)

        return <span>{filterObj ? filterObj.type : row?.filter_type}</span>
      },
      sortable: false
    },
    {
      id: 'values',
      header: 'Values',
      cell: (row: Commission) => {
        switch (row.filter_type) {
          case 'between':
            return (
              <span>
                {row.filter_percent ? `${row.min_amount}%` : formatCurrency(row.min_amount)} - {row.filter_percent ? `${row.max_amount}%` : formatCurrency(row.max_amount)}
              </span>
            )
          case 'greater-than':
            return (
              <span>
                {row.filter_percent ? `${row.min_amount}%` : formatCurrency(row.min_amount)}
              </span>
            )
          case 'less-than':
            return (
              <span>
                {row.filter_percent ? `${row.max_amount}%` : formatCurrency(row.max_amount)}
              </span>
            )
          case 'same-as-store':
            return <span>0</span>
          default:
            return <span>0</span>
        }
      },
      sortable: false
    },
    {
      id: 'amount',
      header: 'Commission Value',
      cell: (row: Commission) => (
        <span>
          {row.commission_percent ? `${row.amount}%` : formatCurrency(row.amount)}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Commission) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditCommission || canDeleteCommission) && (
            <ThreeDotButton
              buttons={[
                ...(canEditCommission
                  ? [
                      <EditButton
                        tooltip='Edit Commission Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteCommission
                  ? [
                      <DeleteButton
                        tooltip='Delete Commission'
                        variant='text'
                        onClick={() => handleDeleteCommission(row.id)}
                      />
                    ]
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
  }

  const handleDeleteCommission = async (id: string) => {
    try {
      await CommissionService.destroy(id)
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
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <TableSearch value={searchValue} onChange={setSearchValue} placeholder='Search...' className='lg:w-80 min-w-0' />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateCommission && (
        <Button className='h-7'
          variant='default'
          size='sm'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Commission</span>
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Commissions' noTabs={true}>
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
          emptyMessage='No commission found'
        />
      </CommonLayout>

      <CreateOrEditCommissionModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        commissionTypes={commissionTypes}
        commissionFilters={commissionFilters}
        commissionBases={commissionBases}
        commissionId={selectedCommissionId || undefined}
        commissionDetails={selectedCommission || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Commissions
