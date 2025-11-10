'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/CommonTable'
import FilterDrawer from '@/components/erp/common/FilterDrawer'
import AdvancedCustomerDetails from '@/components/erp/dashboard/crm/customers/AdvancedCustomerDetails'
import { DetailsIcon, FilterIcon, UserIcon } from '@/public/icons'
import CompanyService from '@/services/api/company.service'

interface CompanyData {
  id: string
  name: string
  phone: string
  company: string
  jobAddress: string
  email: string
  stage: string
  [key: string]: any
}

interface Column {
  id: string
  header: string
  cell: (row: any) => React.ReactNode
  sortable?: boolean
  enableSorting?: boolean
}

interface FilterField {
  key: string
  label: string
  type: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface FilterButton {
  label: string
  action: string
  variant: string
}

interface ApiResponse {
  data: any[]
  per_page: number
  total: number
  from: number
  to: number
  current_page: number
  last_page: number
}

const Companies: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('companies')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
      CompanyService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching companies:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching companies:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(filterOptions)
  }, [filterOptions])

  // Transform API data to match table format
  const companiesData = apiResponse?.data
    ? apiResponse.data.map((company: any, index: number) => ({
        id: company.id,
        index: (apiResponse?.from || 1) + index,
        name: `${company.first_name || ''} ${company.last_name || ''}`.trim(),
        phone: company.userable?.phone || 'N/A',
        company: company.domain?.domain || 'N/A',
        jobAddress: company.userable?.address || 'N/A',
        email: company.email,
        stage: company.status ? 'Active' : 'Inactive'
      }))
    : []

  // Custom actions renderer
  const renderCompanyActions = (row: CompanyData) => (
    <div className='flex gap-2'>
      <button
        onClick={e => {
          e.stopPropagation()
          console.log('Edit company:', row)
          // router.push(`/erp/companies/edit/${row.id}`)
        }}
        className='p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors'
        title='Edit'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
          />
        </svg>
      </button>
      <button
        onClick={e => {
          e.stopPropagation()
          console.log('Delete company:', row)
          // Add delete confirmation logic here
        }}
        className='p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors'
        title='Delete'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
          />
        </svg>
      </button>
    </div>
  )

  // Column definitions for CommonTable
  const companyColumns: Column[] = [
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
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: row => <span>{row.company}</span>,
      sortable: true
    },
    {
      id: 'jobAddress',
      header: 'Job Address',
      cell: row => <span className='max-w-xs truncate'>{row.jobAddress}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='text-blue-400'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'stage',
      header: 'Status',
      cell: row => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.stage === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {row.stage}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => renderCompanyActions(row),
      sortable: false
    }
  ]

  // Company-specific filter configuration
  const companyFilterFields: FilterField[] = [
    {
      key: 'companyId',
      label: 'Company ID',
      type: 'text',
      placeholder: 'Enter company ID'
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name'
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number'
    },
    {
      key: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Enter company name'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter email'
    },
    {
      key: 'jobAddress',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter address'
    },
    {
      key: 'stage',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ]

  const companyFilterButtons: FilterButton[] = [
    { label: 'Clear', action: 'clear', variant: 'outline' },
    { label: 'Apply Filters', action: 'apply', variant: 'primary' }
  ]

  // Event handlers
  const handleFilterDrawerClose = () => {
    setIsFilterDrawerOpen(false)
  }

  const handleApplyFilters = (filters: Record<string, any>) => {
    console.log('Applied company filters:', filters)
    setFilterOptions((prev: any) => ({
      ...prev,
      ...filters,
      page: 1 // Reset to first page when applying filters
    }))
    setIsFilterDrawerOpen(false)
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setIsFilterDrawerOpen(false)
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
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className='flex items-center gap-2 px-3 py-1.5 bg-bg border border-border rounded-md text-light hover:bg-accent transition-colors'
        >
          <FilterIcon />
          Filter
        </button>
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className='px-4 py-2 bg-gray/20 text-gray rounded-md hover:bg-gray/30 transition-colors text-sm'
          >
            Clear Filters
          </button>
        )}
      </div>
      <button
        onClick={() => router.push('/erp/companies/create')}
        className='px-4 py-2 bg-light text-bg rounded-md hover:bg-light/90 transition-colors flex items-center gap-2'
      >
        <PlusIcon className='w-4 h-4' />
        Add Company
      </button>
    </div>
  )

  // Button configuration for CommonLayout
  const buttons = [
    {
      label: 'Companies',
      icon: UserIcon,
      onClick: () => setActiveTab('companies'),
      isActive: activeTab === 'companies'
    },
    {
      label: 'Details',
      icon: DetailsIcon,
      onClick: () => setActiveTab('details'),
      isActive: activeTab === 'details'
    }
  ]

  return (
    <CommonLayout title='Companies' buttons={buttons}>
      {activeTab === 'companies' && (
        <CommonTable
          data={{
            data: companiesData,
            per_page: apiResponse?.per_page || 10,
            total: apiResponse?.total || 0,
            from: apiResponse?.from || 1,
            to: apiResponse?.to || 10,
            current_page: apiResponse?.current_page || 1,
            last_page: apiResponse?.last_page || 1
          }}
          columns={companyColumns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No companies found'
        />
      )}

      {activeTab === 'details' && (
        <AdvancedCustomerDetails customerData={companiesData[0] || null} onEdit={() => console.log('Edit company')} />
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleFilterDrawerClose}
        onApplyFilters={handleApplyFilters}
        title='Filter Companies'
        fields={companyFilterFields}
        buttons={companyFilterButtons}
      />
    </CommonLayout>
  )
}

export default Companies
