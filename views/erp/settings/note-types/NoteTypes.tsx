'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, NoteType } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import NoteTypeService from '@/services/api/settings/note_types.service'
import CreateOrEditNoteTypeModal from './CreateOrEditNoteTypeModal'

const NoteTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedNoteTypeId, setSelectedNoteTypeId] = useState<string | null>(null)
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      NoteTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching note types:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching note types:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Note Types'))
  }, [filterOptions])

  // Transform API data to match table format
  const noteTypesData = apiResponse?.data
    ? apiResponse.data.map((noteType: NoteType, index: number) => {
        return {
          id: noteType.id,
          index: (apiResponse?.from || 1) + index,
          name: noteType.name,
          status: noteType.status ? 'Active' : 'Inactive'
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedNoteTypeId(null)
    setSelectedNoteType(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedNoteTypeId(id)

    // Fetch note type details
    try {
      const response = await NoteTypeService.show(id)
      setSelectedNoteType(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch note type details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNoteTypeId(null)
    setSelectedNoteType(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

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
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: row => (
        <span className={`font-medium ${row.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
          {row.status}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton
            tooltip='Edit Note Type Information'
            onClick={() => handleOpenEditModal(row.id)}
            variant='icon'
          />
          <DeleteButton
            tooltip='Delete Note Type'
            variant='icon'
            onClick={() => handleDeleteNoteType(row.id)}
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

  const handleDeleteNoteType = async (id: string) => {
    try {
      NoteTypeService.destroy(id)
        .then(response => {
          toast.success('Note type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete note type')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the note type!')
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
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
            Clear
          </Button>
        )}
      </div>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Note Type
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Note Types' noTabs={true}>
        <CommonTable
          data={{
            data: noteTypesData,
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
          emptyMessage='No note type found'
        />
      </CommonLayout>

      <CreateOrEditNoteTypeModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        noteTypeId={selectedNoteTypeId || undefined}
        noteTypeDetails={selectedNoteType || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default NoteTypes
