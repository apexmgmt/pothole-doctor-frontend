'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { Column, DataTableApiResponse, ServiceTemplate } from '@/types'
import { getInitialFilters } from '@/utils/utility'
import TableSearch from '@/components/erp/common/TableSearch'
import ServiceTemplateService from '@/services/api/settings/service_templates.service'
import { formatDate } from '@/utils/date'

import debounce from '@/utils/debounce'

interface ServiceTemplatesProps {
  initialData?: DataTableApiResponse<any> | null
  permissions?: {
    canCreateTemplate: boolean
    canEditTemplate: boolean
    canDeleteTemplate: boolean
  }
}

const ServiceTemplates: React.FC<ServiceTemplatesProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<any> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')

  const canCreate = permissions?.canCreateTemplate ?? false
  const canEdit = permissions?.canEditTemplate ?? false
  const canDelete = permissions?.canDeleteTemplate ?? false

  const filterOptions = useMemo(
    () => ({
      ...getInitialFilters(searchParams)
    }),
    [searchParams]
  )

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Service Templates'))
  }, [dispatch])

  const setFilterOptions = (updater: any) => {
    const currentFilters = filterOptions
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

  const handleOpenEditPage = (id: string) => {
    router.push(`/erp/settings/service-templates/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await ServiceTemplateService.destroy(id)
        .then(() => {
          toast.success('Service template deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete service template')
        })
    } catch {
      toast.error('Something went wrong while deleting!')
    }
  }

  const actionColumn: Column = useMemo(
    () => ({
      id: 'actions',
      header: 'Action',
      cell: (row: ServiceTemplate) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEdit || canDelete) && (
            <ThreeDotButton
              buttons={[
                canEdit && (
                  <EditButton
                    key='edit'
                    tooltip='Edit Service Template'
                    variant='text'
                    onClick={() => handleOpenEditPage(row.id)}
                  />
                ),
                canDelete && (
                  <DeleteButton
                    key='delete'
                    tooltip='Delete Service Template'
                    variant='text'
                    onClick={() => handleDelete(row.id)}
                  />
                )
              ].filter(Boolean)}
            />
          )}
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }),
    [canEdit, canDelete]
  )

  const columns: Column[] = useMemo(
    () => [
      {
        id: 'title',
        header: 'Template Title',
        cell: (row: ServiceTemplate) => <span>{row.title || '—'}</span>,
        sortable: true
      },
      {
        id: 'service_type_name',
        header: 'Job Type Name',
        cell: (row: ServiceTemplate) => <span>{row.service_type?.name || '—'}</span>,
        sortable: false
      },
      {
        id: 'created_at',
        header: 'Created Date',
        cell: (row: ServiceTemplate) => <span>{formatDate(row.created_at || '') || '—'}</span>,
        sortable: true
      },
      {
        id: 'created_by',
        header: 'Created By',
        cell: (row: ServiceTemplate) => (
          <span>{[row.created_by?.first_name, row.created_by?.last_name].filter(Boolean).join(' ') || '—'}</span>
        ),
        sortable: false
      },
      actionColumn
    ],
    [actionColumn]
  )

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
          onChange={onSearchChange}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreate && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={() => router.push('/erp/settings/service-templates/create')}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Template</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Service Templates'>
      <CommonTable
        data={{
          data: (apiResponse?.data as ServiceTemplate[]) || [],
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
        emptyMessage='No service templates found'
      />
    </CommonLayout>
  )
}

export default ServiceTemplates
