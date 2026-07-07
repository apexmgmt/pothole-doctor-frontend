'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, UserIcon } from '@/public/icons'
import OrganizationService from '@/services/api/organizations.service'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Organization } from '@/types'
import OrganizationDetails from '@/views/erp/organizations/OrganizationDetails'
import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import AuthService from '@/services/api/auth.service'
import { generateRedirectUrl } from '@/app/actions/auth'
import { appUrl } from '@/utils/utility'
import { toast } from 'sonner'
import CreateOrEditOrganizationModal from '@/views/erp/organizations/CreateOrEditOrganizationModal'
import TableSearch from '@/components/erp/common/TableSearch'

interface OrganizationsProps {
  initialData: DataTableApiResponse | null
  permissions: {
    canCreateCompany: boolean
    canViewCompany: boolean
    canEditCompany: boolean
  }
}

const Organizations: React.FC<OrganizationsProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const { canCreateCompany, canViewCompany, canEditCompany } = permissions

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editCompanyId, setEditCompanyId] = useState<string | undefined>(undefined)
  const [editCompanyDetails, setEditCompanyDetails] = useState<any>(undefined)

  const [activeTab, setActiveTab] = useState<string>('companies')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [statusLoading, setStatusLoading] = useState<{ [key: string]: boolean }>({})

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

  // Replace filterOptions state with a mock setFilterOptions that updates URL directly
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

  // Sync state when server data changes (e.g. from navigation)
  useEffect(() => {
    setApiResponse(initialData)
    setIsLoading(false)
  }, [initialData])

  // Set initial search value from URL and title
  useEffect(() => {
    const filters = getInitialFilters()

    setSearchValue(filters.search || '')
    dispatch(setPageTitle('Manage Companies'))
  }, [])

  // Debounced search setup
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

          const baseUrl = appUrl(response.data.domain ?? '')

          generateRedirectUrl(authData, response.data.domain ?? '').then(redirectUrl => {
            const newWindow = window.open(redirectUrl, '_blank')

            if (!newWindow) {
              toast.error('Pop-up blocked. Please allow pop-ups for this site.')
            }
          })
        })
        .catch(error => {
          toast.error(error?.message || 'Failed to impersonate user')
          console.error('Impersonation error:', error)
        })
    } catch (error) {
      toast.error('Something went wrong during impersonation!')
      console.error('Impersonation exception:', error)
    }
  }

  // Column definitions for CommonTable
  const companyColumns: Column[] = [
    {
      id: 'company_name',
      header: 'Company',
      cell: (row: Organization) => <span>{row?.userable?.company_name ?? ''}</span>,
      sortable: false
    },
    {
      id: 'first_name',
      header: 'Name',
      cell: (row: Organization) => <span>{[row?.first_name, row?.last_name].filter(Boolean).join(' ')}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row: Organization) => <span>{row?.userable?.phone}</span>,
      sortable: true
    },

    {
      id: 'address',
      header: 'Job Address',
      cell: (row: Organization) => <span className='max-w-xs truncate'>{row?.userable?.address ?? '-'}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Organization) => <span>{row.email}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Organization) => (
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
      cell: (row: Organization) => (
        <div className='flex gap-2'>
          {canEditCompany && (
            <ThreeDotButton
              buttons={[
                canEditCompany && (
                  <EditButton
                    tooltip='Edit Company Information'
                    variant='text'
                    onClick={() => {
                      setModalMode('edit')
                      setEditCompanyId(row.id)
                      setEditCompanyDetails(row)
                      setIsModalOpen(true)
                    }}
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
    setSearchValue('')
    setIsFilterDrawerOpen(false)
    setFilterOptions({})
  }

  const handleRowSelect = (company: any) => {
    setSelectedCompanyId(company?.id || null)
  }

  const handleCompanyRowUpdate = (updatedCompany: Organization) => {
    setApiResponse(prev => {
      if (!prev?.data?.length) {
        return prev
      }

      return {
        ...prev,
        data: prev.data.map(company =>
          company.id === updatedCompany.id
            ? {
                ...company,
                ...updatedCompany,
                userable: {
                  ...company.userable,
                  ...updatedCompany.userable
                }
              }
            : company
        )
      }
    })
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
      {canCreateCompany && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={() => {
            setModalMode('create')
            setEditCompanyId(undefined)
            setEditCompanyDetails(undefined)
            setIsModalOpen(true)
          }}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Company</span>
        </Button>
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

      const updatedCompany = apiResponse?.data?.find(company => company.id === companyId)

      if (updatedCompany) {
        const company = {
          ...updatedCompany,
          status: !updatedCompany.status
        }

        handleCompanyRowUpdate(company as Organization)
      }
    } catch (error) {
      console.error('Failed to change status', error)
    }

    setStatusLoading(prev => ({ ...prev, [companyId]: false }))
  }

  const selectedCompany = selectedCompanyId && apiResponse?.data?.find(company => company.id === selectedCompanyId)

  const companyDisplayName = selectedCompany
    ? selectedCompany.userable?.company_name || `${selectedCompany.first_name} ${selectedCompany.last_name}`.trim()
    : ''

  const pageTitle = `Companies${selectedCompany ? ` - ${companyDisplayName}` : ''}`

  return (
    <CommonLayout title={pageTitle} buttons={tabs}>
      <div className={activeTab === 'companies' ? 'block' : 'hidden'}>
        <CommonTable
          data={{
            data: (apiResponse?.data as Organization[]) || [],
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
      </div>

      <div className={activeTab === 'details' ? 'block' : 'hidden'}>
        <OrganizationDetails
          companyId={selectedCompanyId}
          onCompanyUpdated={handleCompanyRowUpdate}
          impersonateUser={impersonateUser}
          isImpersonating={selectedCompanyId ? statusLoading[selectedCompanyId] : false}
          onStatusToggle={handleStatusToggle}
          statusLoading={selectedCompanyId ? statusLoading[selectedCompanyId] : false}
        />
      </div>

      <CreateOrEditOrganizationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        companyId={editCompanyId}
        companyDetails={editCompanyDetails}
        onSuccess={() => router.refresh()}
      />
    </CommonLayout>
  )
}

export default Organizations
