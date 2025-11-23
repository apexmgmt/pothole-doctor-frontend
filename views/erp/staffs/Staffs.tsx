'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, UserIcon } from '@/public/icons'
import StaffService from '@/services/api/staff.service'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import StaffDetails from './StaffDetails'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

const Staffs: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('staffs')
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<object | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')

  // Initialize filterOptions from URL params
  const getInitialFilters = () => {
    const filters: any = {}
    searchParams.forEach((value, key) => {
      // Convert numeric values
      if (key === 'page' || key === 'per_page') {
        filters[key] = parseInt(value)
      } else {
        filters[key] = value
      }
    })

    return filters
  }

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters())

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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      StaffService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching staffs:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching staffs:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage Staffs'))
  }, [filterOptions])

  // Transform API data to match table format
  const staffsData = apiResponse?.data
    ? apiResponse.data.map((staff: any, index: number) => ({
        id: staff.id,
        index: (apiResponse?.from || 1) + index,
        name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
        profilePicture: staff.userable?.profile_picture || null,
        phone: staff.userable?.phone || 'N/A',
        jobAddress: staff.userable?.address || 'N/A',
        email: staff.email
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
      id: 'name',
      header: 'Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className=''>{row.email}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'jobAddress',
      header: 'Job Address',
      cell: row => <span className='max-w-xs truncate'>{row.jobAddress}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Staff Information' link={`/erp/staffs/${row.id}/edit`} variant='icon' />
          <DeleteButton tooltip='Delete Staff' variant='icon' onClick={() => handleDeleteStaff(row.id)} />
        </div>
      ),
      sortable: false
    }
  ]

  const handleDeleteStaff = async (id: string) => {
    try {
      StaffService.destroy(id)
        .then(response => {
          toast.success('Staff deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete staff')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the staff!')
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleRowSelect = (staff: any) => {
    setSelectedStaffId(staff?.id || null)

    StaffService.show(staff?.id)
      .then(response => {
        setSelectedStaff(response.data)
      })
      .catch(error => {
        setSelectedStaff(null)
        console.error('Error fetching staff details:', error)
      })
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
          <Button variant='ghost' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
            Clear Filters
          </Button>
        )}
      </div>
      <Link href='/erp/staffs/create'>
        <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90'>
          <PlusIcon className='w-4 h-4' />
          Add Staff
        </Button>
      </Link>
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
    {
      label: 'Details',
      icon: DetailsIcon,
      onClick: () => setActiveTab('details'),
      isActive: activeTab === 'details',
      disabled: !selectedStaffId
    }
  ]

  return (
    <CommonLayout title='Staffs' buttons={tabs}>
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
        <StaffDetails staffData={selectedStaff} setStaffData={setSelectedStaff} fetchData={fetchData} />
      )}
    </CommonLayout>
  )
}

export default Staffs
