'use client'

import React, { useState, useEffect } from 'react'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Client, Column, DataTableApiResponse } from '@/types'
import { formatDate } from '@/utils/date'
import ClientService from '@/services/api/clients/clients.service'

const BusinessLocationClients: React.FC<{
  locationId: string
  type: 'customer' | 'lead'
}> = ({ locationId, type }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})

  // Debounced search update
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

    ClientService.index({ ...filterOptions, type, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error(`Failed to fetch ${type === 'lead' ? 'leads' : 'customers'}`)
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (_row: Client, rowIndex: number | undefined) => {
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Client) => <span className='font-medium'>{row?.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'first_name',
      header: 'First Name',
      cell: (row: Client) => <span className='font-medium'>{row.first_name}</span>,
      sortable: false
    },
    {
      id: 'last_name',
      header: 'Last Name',
      cell: (row: Client) => <span className='font-medium'>{row.last_name}</span>,
      sortable: false
    },
    ...(type === 'lead'
      ? [
          {
            id: 'created_at',
            header: 'Date Created',
            cell: (row: Client) => <span className='font-medium'>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'days_since_created',
            header: 'Days Since Created',
            cell: (row: Client) => (
              <span className='font-medium'>
                {Math.floor((new Date().getTime() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            ),
            sortable: false
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || '—'}</span>,
            sortable: false
          },
          {
            id: 'desired_services',
            header: 'Service/Interest',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => (
                  <Badge key={ds.id}>{ds.name}</Badge>
                ))}
              </div>
            ),
            sortable: false
          }
        ]
      : [
          {
            id: 'spouse_name',
            header: 'Spouse Name',
            cell: (row: Client) => <span className='font-medium'>{row?.clientable?.spouse_name || '—'}</span>,
            sortable: false
          },
          {
            id: 'added_by',
            header: 'Added By',
            cell: (row: Client) => (
              <span className='font-medium'>
                {row?.added_by ? `${row.added_by.first_name} ${row.added_by.last_name}` : '—'}
              </span>
            ),
            sortable: false
          },
          {
            id: 'desired_services',
            header: 'Desired Services',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => (
                  <Badge key={ds.id}>{ds.name}</Badge>
                ))}
              </div>
            ),
            sortable: false
          },
          {
            id: 'interest_level',
            header: 'Interest Level',
            cell: (row: Client) => <span className='font-medium'>{row?.interest_level?.name || '—'}</span>,
            sortable: false
          },
          {
            id: 'created_at',
            header: 'Date Added',
            cell: (row: Client) => <span className='font-medium'>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || '—'}</span>,
            sortable: false
          }
        ]),
    {
      id: 'cell_phone',
      header: 'Cell Phone',
      cell: (row: Client) => <span className='font-medium'>{row?.clientable?.cell_phone || '—'}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Client) => <span className='font-medium'>{row?.email || '—'}</span>,
      sortable: true
    },
    {
      id: 'reference',
      header: 'Sales Rep.',
      cell: (row: Client) => (
        <span className='font-medium'>
          {row?.reference ? `${row.reference.first_name} ${row.reference.last_name}` : '—'}
        </span>
      ),
      sortable: false
    }
  ]

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const customFilters = (
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
  )

  return (
    <CommonTable
      data={{
        data: (apiResponse?.data as Client[]) || [],
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
      emptyMessage={`No ${type === 'lead' ? 'leads' : 'customers'} found for this location`}
    />
  )
}

export default BusinessLocationClients
