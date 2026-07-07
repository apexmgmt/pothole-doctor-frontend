'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, UserIcon } from '@/public/icons'
import StaffService from '@/services/api/staff.service'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Staff } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import StaffDetails from './StaffDetails'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { generateFileUrl, getInitialFilters } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'
import TableSearch from '@/components/erp/common/TableSearch'

interface StaffsProps {
  initialData: DataTableApiResponse<Staff> | null
  permissions: {
    canCreateStaff: boolean
    canViewStaff: boolean
    canEditStaff: boolean
    canDeleteStaff: boolean
  }
}

const Staffs: React.FC<StaffsProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const { canCreateStaff, canViewStaff, canEditStaff, canDeleteStaff } = permissions

  const [activeTab, setActiveTab] = useState<string>('staffs')
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Staff> | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')

  const getInitialFilters = () => {
    const filters: any = {}

    searchParams.forEach((value, key) => {
      if (key === 'page' || key === 'per_page') {
        filters[key] = parseInt(value)
      } else {
        filters[key] = value
      }
    })

    return filters
  }

  const setFilterOptions = (updater: any) => {
    const currentFilters = getInitialFilters()
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
    setApiResponse(initialData)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    const filters = getInitialFilters()

    setSearchValue(filters.search || '')
    dispatch(setPageTitle('Manage Staffs'))
  }, [])

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

  // Transform API data to match table format
  const staffsData = apiResponse?.data
    ? apiResponse.data.map((staff: any, index: number) => ({
        id: staff.id,
        index: (apiResponse?.from || 1) + index,
        name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
        profilePicture: generateFileUrl(staff.userable?.profile_picture) || null,
        phone: staff.userable?.phone || 'N/A',
        jobAddress: staff.userable?.address || 'N/A',
        email: staff.email,
        guard: staff.guard
      }))
    : []

  // Column definitions for CommonTable
  const staffColumns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false
    },
    {
      id: 'profilePicture',
      header: 'Profile Picture',
      cell: row => (
        <Avatar className='h-10 w-10'>
          <AvatarImage src={row.profilePicture} alt={row.name} />
          <AvatarFallback className='bg-border text-light text-xs font-medium'>{row.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
      sortable: false
    },
    {
      id: 'first_name',
      header: 'Name',
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span>{row.email}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: false
    },
    {
      id: 'jobAddress',
      header: 'Job Address',
      cell: row => <span className='max-w-xs truncate'>{row.jobAddress}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditStaff || canDeleteStaff) && row.guard !== 'admin' && (
            <ThreeDotButton
              buttons={[
                ...(canEditStaff
                  ? [<EditButton tooltip='Edit Staff Information' link={`/erp/staffs/${row.id}/edit`} variant='text' />]
                  : []),
                ...(canDeleteStaff
                  ? [<DeleteButton tooltip='Delete Staff' variant='text' onClick={() => handleDeleteStaff(row.id)} />]
                  : [])
              ]}
            />
          )}
        </div>
      ),
      sortable: false
    }
  ]

  const handleDeleteStaff = async (id: string) => {
    try {
      await StaffService.destroy(id)
        .then(response => {
          toast.success('Staff deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete staff')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the staff!')
    }
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setFilterOptions({})
  }

  const handleRowSelect = (staff: any) => {
    if (canViewStaff) {
      StaffService.show(staff?.id)
        .then(response => {
          setSelectedStaff(response.data)
          setSelectedStaffId(staff?.id || null)
        })
        .catch(error => {
          setSelectedStaff(null)
          console.error('Error fetching staff details:', error)
        })
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(getInitialFilters()).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <TableSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='ghost' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear Filters
          </Button>
        )}
      </div>
      {canCreateStaff && (
        <Link href='/erp/staffs/create'>
          <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90 h-7'>
            <PlusIcon className='w-4 h-4' />
            <span className='hidden min-[480px]:block'>Add Staff</span>
          </Button>
        </Link>
      )}
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Staffs',
      icon: UserIcon,
      onClick: () => setActiveTab('staffs'),
      isActive: activeTab === 'staffs'
    },
    ...(canViewStaff
      ? [
          {
            label: 'Details',
            icon: DetailsIcon,
            onClick: () => setActiveTab('details'),
            isActive: activeTab === 'details',
            disabled: !selectedStaffId
          }
        ]
      : [])
  ]

  const selectedUser = selectedStaffId && apiResponse?.data?.find(staff => staff.id === selectedStaffId)

  const pageTitle = `Staffs${selectedUser ? ` - ${selectedUser.first_name} ${selectedUser.last_name}` : ''}`

  return (
    <CommonLayout title={pageTitle} buttons={tabs}>
      {activeTab === 'staffs' && (
        <CommonTable
          data={{
            data: staffsData,
            per_page: apiResponse?.per_page || 10,
            total: apiResponse?.total || 0,
            from: apiResponse?.from || 1,
            to: apiResponse?.to || 10,
            current_page: apiResponse?.current_page || 1,
            last_page: apiResponse?.last_page || 1
          }}
          columns={staffColumns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No staff found'
          handleRowSelect={handleRowSelect}
        />
      )}

      {activeTab === 'details' && (
        <StaffDetails
          staffData={selectedStaff}
          setStaffData={setSelectedStaff}
          fetchData={() => router.refresh()}
          canEditStaff={canEditStaff}
        />
      )}
    </CommonLayout>
  )
}

export default Staffs
