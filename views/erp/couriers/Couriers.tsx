'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Courier } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CourierService from '@/services/api/couriers.service'
import CreateOrEditCourierModal from './CreateOrEditCourierModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'

const Couriers: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [canCreateCourier, setCanCreateCourier] = useState<boolean>(false)
  const [canEditCourier, setCanEditCourier] = useState<boolean>(false)
  const [canDeleteCourier, setCanDeleteCourier] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Courier').then(result => setCanCreateCourier(result))
    hasPermission('Update Courier').then(result => setCanEditCourier(result))
    hasPermission('Delete Courier').then(result => setCanDeleteCourier(result))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
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

  const fetchData = async () => {
    setIsLoading(true)

    CourierService.index(filterOptions)
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        console.error('Error fetching couriers:', error)
      })
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Couriers'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedCourierId(null)
    setSelectedCourier(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedCourierId(id)

    try {
      const response = await CourierService.show(id)

      setSelectedCourier(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch courier details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCourierId(null)
    setSelectedCourier(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteCourier = async (id: string) => {
    try {
      await CourierService.destroy(id)
        .then(() => {
          toast.success('Courier deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete courier')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the courier!')
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: Courier, rowIndex: number | undefined) => {
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Name',
      cell: (row: Courier) => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Courier) => <span className='font-medium'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'contact_number',
      header: 'Contact Number',
      cell: (row: Courier) => <span className='font-medium'>{row.contact_number}</span>,
      sortable: false
    },
    {
      id: 'website',
      header: 'Website',
      cell: (row: Courier) => (
        <a
          href={row.website}
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-blue-600 hover:underline'
        >
          {row.website}
        </a>
      ),
      sortable: false
    },
    {
      id: 'fax',
      header: 'Fax',
      cell: (row: Courier) => <span className='font-medium'>{row.fax}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Courier) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditCourier || canDeleteCourier) && (
            <ThreeDotButton
              buttons={[
                canEditCourier && (
                  <EditButton
                    tooltip='Edit Courier Information'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeleteCourier && (
                  <DeleteButton tooltip='Delete Courier' variant='text' onClick={() => handleDeleteCourier(row.id)} />
                )
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
      {canCreateCourier && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Courier
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Couriers' noTabs={true}>
      <CommonTable
        columns={columns}
        data={{
          data: (apiResponse?.data as Courier[]) || [],
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        isLoading={isLoading}
        setFilterOptions={setFilterOptions}
        customFilters={customFilters}
      />

      <CreateOrEditCourierModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courierId={selectedCourierId ?? undefined}
        courierDetails={selectedCourier ?? undefined}
        onSuccess={handleSuccess}
      />
    </CommonLayout>
  )
}

export default Couriers
