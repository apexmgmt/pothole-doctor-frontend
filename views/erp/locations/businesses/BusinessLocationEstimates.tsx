'use client'

import React, { useState, useEffect } from 'react'

import Link from 'next/link'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Estimate } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Description } from '@/components/ui/description'
import { formatDate } from '@/utils/date'
import EstimateService from '@/services/api/estimates/estimates.service'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocationEstimates: React.FC<{ locationId: string }> = ({ locationId }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [canDeleteEstimate, setCanDeleteEstimate] = useState<boolean>(false)
  const [canViewEstimate, setCanViewEstimate] = useState<boolean>(false)

  useEffect(() => {
    hasPermission('View Estimate').then(result => setCanViewEstimate(result))
    hasPermission('Delete Estimate').then(result => setCanDeleteEstimate(result))
  }, [])

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

    EstimateService.index({ ...filterOptions, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error('Failed to fetch estimates')
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const handleDeleteEstimate = async (id: string) => {
    try {
      await EstimateService.destroy(id)
      toast.success('Estimate deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete estimate')
    }
  }

  const columns: Column[] = [
    {
      id: 'estimate_number',
      header: 'Estimate #',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`}>
          <span className='font-medium hover:underline'>{row.estimate_number?.toString().padStart(6, '0')}</span>
        </Link>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Estimate) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'biding_date',
      header: 'Date',
      cell: (row: Estimate) => <span className='font-medium'>{formatDate(row?.biding_date) || '—'}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Estimate) => <span className='font-medium'>{row?.client?.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Estimate) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'address',
      header: 'Job Address',
      cell: (row: Estimate) => (
        <Description
          description={
            row.address
              ? `${row.address.street_address}, ${row.address.city?.name}, ${row.address.state?.name} ${row.address.zip_code}`
              : ''
          }
        />
      ),
      sortable: false
    },
    {
      id: 'service_type',
      header: 'Service Type',
      cell: (row: Estimate) => <span className='font-medium'>{row?.service_type?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Estimate) => (
        <div className='flex items-center justify-center gap-2'>
          {(canViewEstimate || canDeleteEstimate) && (
            <ThreeDotButton
              buttons={[
                ...(canViewEstimate
                  ? [<ViewButton tooltip='View Estimate Details' link={`/erp/estimates/${row.id}`} variant='text' />]
                  : []),
                ...(canDeleteEstimate
                  ? [
                      <DeleteButton
                        tooltip='Delete Estimate'
                        variant='text'
                        onClick={() => handleDeleteEstimate(row.id)}
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
        data: (apiResponse?.data as Estimate[]) || [],
        per_page: apiResponse?.per_page || 10,
        total: apiResponse?.total || 0,
        from: apiResponse?.from || 1,
        to: apiResponse?.to || 10,
        current_page: apiResponse?.current_page || 1,
        last_page: apiResponse?.last_page || 1
      }}
      columns={columns}
      customFilters={<></>}
      setFilterOptions={setFilterOptions}
      showFilters={true}
      pagination={true}
      isLoading={isLoading}
      emptyMessage='No estimates found for this location'
    />
  )
}

export default BusinessLocationEstimates
