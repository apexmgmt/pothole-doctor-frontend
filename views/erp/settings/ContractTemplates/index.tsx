'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, ContractTemplate, DataTableApiResponse, EstimateType } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ContractTemplateService from '@/services/api/settings/contract_templates.service'
import CreateOrEditContractTemplateModal from './CreateOrEditContractTemplateModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import TableSearch from '@/components/erp/common/TableSearch'

interface ContractTemplatesProps {
  estimateTypes: EstimateType[]
}

const ContractTemplates: React.FC<ContractTemplatesProps> = ({ estimateTypes }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>(undefined)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const [canCreateTemplate, setCanCreateTemplate] = useState<boolean>(false)
  const [canEditTemplate, setCanEditTemplate] = useState<boolean>(false)
  const [canDeleteTemplate, setCanDeleteTemplate] = useState<boolean>(false)

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Contract Template').then(result => {
      setCanCreateTemplate(result)
    })

    hasPermission('Update Contract Template').then(result => {
      setCanEditTemplate(result)
    })

    hasPermission('Delete Contract Template').then(result => {
      setCanDeleteTemplate(result)
    })
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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      const response = await ContractTemplateService.index(filterOptions)

      setApiResponse(response.data)
    } catch (error) {
      console.error('Error fetching contract templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Contract Templates'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedTemplateId(undefined)
    setSelectedTemplate(undefined)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedTemplateId(id)

    try {
      const response = await ContractTemplateService.show(id)

      setSelectedTemplate(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch contract template details')
    }
  }

  const handleOpenViewModal = async (id: string) => {
    setModalMode('view')
    setSelectedTemplateId(id)

    try {
      const response = await ContractTemplateService.show(id)

      setSelectedTemplate(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch contract template details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTemplateId(undefined)
    setSelectedTemplate(undefined)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await ContractTemplateService.destroy(id)
      toast.success('Contract template deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete contract template')
    }
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'contract_name',
      header: 'Contract Name',
      cell: (row: ContractTemplate) => <span>{row.contract_name}</span>,
      sortable: true
    },
    {
      id: 'template_message',
      header: 'Content',
      cell: (row: ContractTemplate) => (
        <div
          className='line-clamp-2 text-xs! text-accent-foreground! max-w-xs [&_*]:!text-accent-foreground [&_*]:!bg-transparent [&_*]:!font-normal'
          dangerouslySetInnerHTML={{ __html: row.template_message || '' }}
        />
      ),
      sortable: false
    },
    {
      id: 'is_invoice_contract',
      header: 'Invoice Contract',
      cell: (row: ContractTemplate) => <span>{row.is_invoice_contract ? 'Yes' : 'No'}</span>,
      sortable: true
    },
    {
      id: 'is_default_invoice_contract',
      header: 'Is Invoice Default',
      cell: (row: ContractTemplate) => <span>{row.is_default_invoice_contract ? 'Yes' : 'No'}</span>,
      sortable: true
    },
    {
      id: 'is_quote_contract',
      header: 'Quote Contract',
      cell: (row: ContractTemplate) => <span>{row.is_quote_contract ? 'Yes' : 'No'}</span>,
      sortable: true
    },
    {
      id: 'is_default_quote_contract',
      header: 'Is Quote Default',
      cell: (row: ContractTemplate) => <span>{row.is_default_quote_contract ? 'Yes' : 'No'}</span>,
      sortable: true
    },
    {
      id: 'contract_type_id',
      header: 'Contract Invoice Type',
      cell: (row: ContractTemplate) => {
        const typeObj = estimateTypes?.find(t => t.id === row.contract_type_id)

        return <span>{typeObj ? typeObj.name : row.contract_type_id}</span>
      },
      sortable: false
    },
    {
      id: 'order',
      header: 'Order',
      cell: (row: ContractTemplate) => <span>{row.order || '-'}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: ContractTemplate) => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <ViewButton
                key='view'
                tooltip='View Contract Template'
                onClick={() => handleOpenViewModal(row.id)}
                variant='text'
              />,
              ...(canEditTemplate
                ? [
                    <EditButton
                      key='edit'
                      tooltip='Edit Contract Template'
                      onClick={() => handleOpenEditModal(row.id)}
                      variant='text'
                    />
                  ]
                : []),
              ...(canDeleteTemplate
                ? [
                    <DeleteButton
                      key='delete'
                      tooltip='Delete Contract Template'
                      variant='text'
                      onClick={() => handleDeleteTemplate(row.id)}
                    />
                  ]
                : [])
            ]}
          />
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

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

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
      {canCreateTemplate && (
        <Button className='h-7' variant='default' size='sm' onClick={handleOpenCreateModal}>
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Template</span>
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Contract Templates' noTabs={true}>
        <CommonTable
          data={{
            data: apiResponse?.data || [],
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
          emptyMessage='No contract templates found'
        />
      </CommonLayout>

      {isModalOpen && (
        <CreateOrEditContractTemplateModal
          mode={modalMode}
          open={isModalOpen}
          onOpenChange={handleModalClose}
          estimateTypes={estimateTypes}
          templateId={selectedTemplateId}
          templateDetails={selectedTemplate}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

export default ContractTemplates
