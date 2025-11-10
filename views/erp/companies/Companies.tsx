'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/CommonTable'
import FilterDrawer from '@/components/erp/common/FilterDrawer'
import AdvancedCustomerDetails from '@/components/erp/dashboard/crm/customers/AdvancedCustomerDetails'
import { DetailsIcon, UserIcon } from '@/public/icons'

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

interface ActionButton {
  label: string
  action: string
  variant: string
  icon?: React.ComponentType<any> | React.ReactNode
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

const Companies: React.FC<{ companiesResponse: any }> = ({ companiesResponse }) => {
  console.log('Companies Response:', companiesResponse)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('companies')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>({
    current_page: 1,
    per_page: 10
  })

  // Transform API data to match table format
  const companiesData = companiesResponse?.data
    ? companiesResponse.data.map((company: any, index: number) => ({
        id: company.id,
        index: (companiesResponse?.from || 1) + index - 1, // Adjust index based on from value
        name: `${company.first_name} ${company.last_name}`,
        phone: company.userable?.phone || 'N/A',
        company: company.domain?.domain || 'N/A',
        jobAddress: company.userable?.address || 'N/A',
        email: company.email,
        stage: company.status ? 'Active' : 'Inactive'
      }))
    : []

  // Column definitions for CommonTable
  const companyColumns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span>{row.index}</span>,
      sortable: false
    },
    {
      id: 'name',
      header: 'Name',
      cell: row => <span>{row.name}</span>,
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
      cell: row => <span>{row.jobAddress}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span>{row.email}</span>,
      sortable: true
    },
    {
      id: 'stage',
      header: 'Status',
      cell: row => (
        <span
          className={`px-2 py-1 rounded text-xs ${
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

  // Custom actions renderer
  const renderCompanyActions = (row: CompanyData) => (
    <div className='flex gap-2'>
      <button
        onClick={e => {
          e.stopPropagation()
          console.log('Edit company:', row)
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

  // Company-specific filter configuration
  const companyFilterFields: FilterField[] = [
    {
      key: 'companyId',
      label: 'Company ID',
      type: 'text',
      placeholder: 'Enter company ID'
    },
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
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
      current_page: 1 // Reset to first page when applying filters
    }))
    setIsFilterDrawerOpen(false)
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center gap-2'>
      <button
        onClick={() => setIsFilterDrawerOpen(true)}
        className='px-4 py-2 bg-accent text-light rounded-md hover:bg-accent/80 transition-colors'
      >
        Filter Companies
      </button>
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
            per_page: companiesResponse?.per_page || 10,
            total: companiesResponse?.total || 0,
            from: companiesResponse?.from || 1,
            to: companiesResponse?.to || 10,
            current_page: companiesResponse?.current_page || 1,
            last_page: companiesResponse?.last_page || 1
          }}
          columns={companyColumns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={false}
          emptyMessage='No companies found'
        />
      )}

      {activeTab === 'details' && (
        <AdvancedCustomerDetails
          customerData={companiesData[0]} // Pass the first company as sample data
          onEdit={() => console.log('Edit company')}
        />
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
