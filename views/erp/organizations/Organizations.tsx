'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import { FingerprintIcon, PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import FilterDrawer from '@/components/erp/common/FilterDrawer'
import AdvancedCustomerDetails from '@/components/erp/dashboard/crm/customers/AdvancedCustomerDetails'
import { DetailsIcon, FilterIcon, UserIcon } from '@/public/icons'
import OrganizationService from '@/services/api/organizations.service'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import OrganizationDetails from '@/views/erp/organizations/OrganizationDetails'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import AuthService from '@/services/api/auth.service'
import { encryptData } from '@/utils/encryption'
import { appUrl } from '@/utils/utility'
import { toast } from 'sonner'

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

const Organizations: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('companies')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<object | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [statusLoading, setStatusLoading] = useState<{ [key: string]: boolean }>({})
  const [canCreateCompany, setCanCreateCompany] = useState<boolean>(false)
  const [canViewCompany, setCanViewCompany] = useState<boolean>(false)
  const [canEditCompany, setCanEditCompany] = useState<boolean>(false)

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

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // check permissions
    hasPermission('Create Company').then(result => setCanCreateCompany(result))
    hasPermission('View Company').then(result => setCanViewCompany(result))
    hasPermission('Update Company').then(result => setCanEditCompany(result))
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
      OrganizationService.index(filterOptions)
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
    dispatch(setPageTitle('Manage Companies'))
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
        status: company.status
      }))
    : []

  const impersonateUser = async (userId: string) => {
    try {
      AuthService.impersonate(userId)
        .then(response => {
          const authData = {
            access_token: response?.data.access_token,
            refresh_token: response?.data.refresh_token,
            token_type: response?.data.token_type,
            expires_in: response?.data.expires_in,
            user: response?.data?.user,
            roles: response?.data?.roles || [],
            permissions: response?.data?.permissions || []
          }

          const encryptedData = encryptData(authData)
          const redirectUrl = `${appUrl(response.data.domain ?? '')}/erp/redirecting?data=${encodeURIComponent(encryptedData)}`

          window.location.href = redirectUrl
        })
        .catch(error => {
          toast.error(error?.message || 'Failed to impersonate user')
        })
    } catch (error) {
      toast.error('Something went wrong during impersonation!')
    }
  }

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
      cell: row => <span className=''>{row.email}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: row => (
        <div className='flex items-center gap-2'>
          <OrganizationStatusSwitch
            checked={row.status}
            loading={statusLoading[row.id]}
            companyId={row.id}

            // fetchData={fetchData} // pass only if you want to refetch after change
          />
        </div>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex gap-2'>
          {canEditCompany && (
            <ThreeDotButton
              buttons={[
                canEditCompany && (
                  <EditButton
                    tooltip='Edit Company Information'
                    link={`/erp/companies/${row.id}/edit`}
                    variant='text'
                  />
                ),
                canEditCompany && (
                  <Button
                    variant='ghost'
                    size='icon'
                    type='button'
                    className={` w-full`}
                    onClick={() => impersonateUser(row.id)}
                  >
                    Impersonate
                  </Button>
                )
              ]}
            />
          )}
        </div>
      ),
      sortable: false
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
    setIsFilterDrawerOpen(false)
  }

  const handleRowSelect = (company: any) => {
    setSelectedCompanyId(company?.id || null)

    if (canViewCompany) {
      OrganizationService.show(company?.id)
        .then(response => {
          setSelectedCompany(response.data)
        })
        .catch(error => {
          setSelectedCompany(null)
          console.error('Error fetching company details:', error)
        })
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
      {canCreateCompany && (
        <Link href='/erp/companies/create'>
          <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90'>
            <PlusIcon className='w-4 h-4' />
            Add Company
          </Button>
        </Link>
      )}
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Companies',
      icon: UserIcon,
      onClick: () => setActiveTab('companies'),
      isActive: activeTab === 'companies'
    },
    ...(canViewCompany
      ? [
          {
            label: 'Details',
            icon: DetailsIcon,
            onClick: () => setActiveTab('details'),
            isActive: activeTab === 'details',
            disabled: !selectedCompanyId
          }
        ]
      : [])
  ]

  const handleStatusToggle = async (companyId: string) => {
    setStatusLoading(prev => ({ ...prev, [companyId]: true }))

    try {
      await OrganizationService.changeStatus(companyId)

      // Refetch data after status change
      fetchData()
    } catch (error) {
      // Optionally show error
      console.error('Failed to change status', error)
    }

    setStatusLoading(prev => ({ ...prev, [companyId]: false }))
  }

  return (
    <CommonLayout title='Companies' buttons={tabs}>
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
          handleRowSelect={handleRowSelect}
        />
      )}

      {activeTab === 'details' && (
        <OrganizationDetails companyData={selectedCompany} setCompanyData={setSelectedCompany} fetchData={fetchData} />
      )}
    </CommonLayout>
  )
}

export default Organizations
