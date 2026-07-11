'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, EstimateType, DataTableApiResponse } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import CreateOrEditEstimateTypeModal from './CreateOrEditEstimateTypeModal'
import TableSearch from '@/components/erp/common/TableSearch'

interface EstimateTypesProps {
  initialData?: DataTableApiResponse<EstimateType> | null
  permissions?: {
    canCreateType: boolean
    canEditType: boolean
    canDeleteType: boolean
  }
}

const EstimateTypes: React.FC<EstimateTypesProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<EstimateType> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedEstimateTypeId, setSelectedEstimateTypeId] = useState<string | null>(null)
  const [selectedEstimateType, setSelectedEstimateType] = useState<EstimateType | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const canCreateEstimateType = permissions?.canCreateType ?? false
  const canEditEstimateType = permissions?.canEditType ?? false
  const canDeleteEstimateType = permissions?.canDeleteType ?? false

  const filterOptions = useMemo(
    () => ({
      ...getInitialFilters(searchParams)
    }),
    [searchParams]
  )

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Estimate Types'))
  }, [dispatch])

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
    setSelectedEstimateTypeId(null)
    setSelectedEstimateType(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string, estimateType: EstimateType) => {
    setModalMode('edit')
    setSelectedEstimateTypeId(id)
    setSelectedEstimateType(estimateType)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEstimateTypeId(null)
    setSelectedEstimateType(null)
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
      cell: (row, rowIndex) => {
        // Calculate the absolute index based on pagination
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Title',
      cell: row => <span>{row.name}</span>,
      sortable: true
    }

    // {
    //   id: 'actions',
    //   header: 'Action',
    //   cell: row => (
    //     <div className='flex items-center justify-center gap-2'>
    //       {(canEditEstimateType || canDeleteEstimateType) && (
    //         <ThreeDotButton
    //           buttons={[
    //             ...(canEditEstimateType
    //               ? [
    //                   <EditButton
    //                     tooltip='Edit Estimate Type Information'
    //                     onClick={() => handleOpenEditModal(row.id, row)}
    //                     variant='text'
    //                   />
    //                 ]
    //               : []),
    //             ...(canDeleteEstimateType
    //               ? [
    //                   <DeleteButton
    //                     tooltip='Delete Estimate Type'
    //                     variant='text'
    //                     onClick={() => handleDeleteEstimateType(row.id)}
    //                   />
    //                 ]
    //               : [])
    //           ]}
    //         />
    //       )}
    //     </div>
    //   ),
    //   sortable: false,
    //   headerAlign: 'center',
    //   size: 30
    // }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteEstimateType = async (id: string) => {
    try {
      await EstimateTypeService.destroy(id)
        .then(response => {
          toast.success('Estimate type deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete estimate type')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the estimate type!')
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
        <TableSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {/* {canCreateEstimateType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Estimate Type
        </Button>
      )} */}
    </div>
  )

  return (
    <>
      <CommonLayout title='Estimate Types' noTabs={true}>
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
          emptyMessage='No estimate type found'
        />
      </CommonLayout>

      {/* <CreateOrEditEstimateTypeModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        estimateTypeId={selectedEstimateTypeId || undefined}
        estimateTypeDetails={selectedEstimateType || undefined}
        onSuccess={handleSuccess}
      /> */}
    </>
  )
}

export default EstimateTypes
