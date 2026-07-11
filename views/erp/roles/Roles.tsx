'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import RoleService from '@/services/api/role.service'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters } from '@/utils/utility'
import TableSearch from '@/components/erp/common/TableSearch'

interface RoleData {
  id: string
  name: string
}

const Roles: React.FC<{
  initialData?: DataTableApiResponse<any> | null
  permissions?: { canCreateRole: boolean; canEditRole: boolean; canDeleteRole: boolean }
}> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<any> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const [selectedRole, setSelectedRole] = useState<object | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const canCreateRole = permissions?.canCreateRole ?? false
  const canEditRole = permissions?.canEditRole ?? false
  const canDeleteRole = permissions?.canDeleteRole ?? false

  // Set initial search value from filterOptions
  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

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

  useEffect(() => {
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage Roles'))
  }, [filterOptions])

  // Transform API data to match table format
  const rolesData = apiResponse?.data
    ? apiResponse.data.map((role: any, index: number) => ({
        id: role.id,
        index: (apiResponse?.from || 1) + index,
        name: role.name,
        is_editable: role.is_editable
      }))
    : []

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
      header: 'Name',
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditRole || canDeleteRole) && row.is_editable && (
            <ThreeDotButton
              buttons={[
                canEditRole && (
                  <EditButton tooltip='Edit Role Information' link={`/erp/roles/${row.id}/edit`} variant='text' />
                ),
                canDeleteRole && (
                  <DeleteButton tooltip='Delete Role' variant='text' onClick={() => handleDeleteRole(row.id)} />
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  // const handleRowSelect = (role: any) => {
  //   RoleService.show(role?.id)
  //     .then(response => {
  //       setSelectedRole(response.data)
  //     })
  //     .catch(error => {
  //       setSelectedRole(null)
  //       console.error('Error fetching role details:', error)
  //     })
  // }

  const handleDeleteRole = async (id: string) => {
    try {
      await RoleService.destroy(id)
        .then(response => {
          toast.success('Role deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete role')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the role!')
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
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateRole && (
        <Link href='/erp/roles/create'>
          <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90 h-7'>
            <PlusIcon className='w-4 h-4' />
            <span className='hidden min-[480px]:block'>Add Role</span>
          </Button>
        </Link>
      )}
    </div>
  )

  return (
    <CommonLayout title='Roles' noTabs={true}>
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

        // handleRowSelect={handleRowSelect}
      />
    </CommonLayout>
  )
}

export default Roles
