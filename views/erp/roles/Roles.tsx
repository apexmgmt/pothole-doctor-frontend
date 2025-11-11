'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, FilterIcon, UserIcon } from '@/public/icons'
import CompanyService from '@/services/api/company.service'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import RoleService from '@/services/api/role.service'

interface RoleData {
  id: string
  name: string
}

const Roles: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('roles')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<object | null>(null)
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
      RoleService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching roles:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching roles:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage Roles'))
  }, [filterOptions])

  // Transform API data to match table format
  const rolesData = apiResponse?.data
    ? apiResponse.data.map((role: any, index: number) => ({
        id: role.id,
        index: (apiResponse?.from || 1) + index,
        name: role.name
      }))
    : []

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false
    },
    {
      id: 'name',
      header: 'Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex justify-center gap-2'>
          <EditButton tooltip='Edit Role Information' link={`/erp/roles/${row.id}/edit`} variant='icon' />
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
    setIsFilterDrawerOpen(false)
  }

  const handleRowSelect = (company: any) => {
    setSelectedRoleId(company?.id || null)

    CompanyService.show(company?.id)
      .then(response => {
        setSelectedRole(response.data)
      })
      .catch(error => {
        setSelectedRole(null)
        console.error('Error fetching company details:', error)
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
      <Button
        variant='default'
        size='sm'
        onClick={() => router.push('/erp/roles/create')}
        className='bg-light text-bg hover:bg-light/90'
      >
        <PlusIcon className='w-4 h-4' />
        Add Role
      </Button>
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Roles',
      icon: UserIcon,
      onClick: () => setActiveTab('roles'),
      isActive: activeTab === 'roles'
    },
    {
      label: 'Details',
      icon: DetailsIcon,
      onClick: () => setActiveTab('details'),
      isActive: activeTab === 'details',
      disabled: !selectedRoleId
    }
  ]

  return (
    <CommonLayout title='Roles' buttons={tabs}>
      {activeTab === 'roles' && (
        <CommonTable
          data={{
            data: rolesData,
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
          emptyMessage='No Roles found'
          handleRowSelect={handleRowSelect}
        />
      )}

      {/* {activeTab === 'details' && (
        <RoleDetails roleData={selectedRole} setRoleData={setSelectedRole} fetchData={fetchData} />
      )} */}
    </CommonLayout>
  )
}

export default Roles
