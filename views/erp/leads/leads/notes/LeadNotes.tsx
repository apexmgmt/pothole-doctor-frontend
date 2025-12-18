import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import LeadNoteService from '@/services/api/leads/lead-notes.service'
import { Column, DataTableApiResponse, LeadNote, NoteType } from '@/types'
import { formatDate } from '@/utils/date'
import { PlusIcon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CreateOrEditNoteModal from './CreateOrEditNoteModal'
import EditButton from '@/components/erp/common/buttons/EditButton'

const LeadNotes = ({ clientId, noteTypes }: { clientId: string; noteTypes: NoteType[] }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<LeadNote | null>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: clientId })

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

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
    try {
      LeadNoteService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching Notes')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching Notes')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedNoteId(null)
    setSelectedNote(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedNoteId(id)
    try {
      const response = await LeadNoteService.show(id)
      setSelectedNote(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch note details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNoteId(null)
    setSelectedNote(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteNote = async (id: string) => {
    try {
      LeadNoteService.destroy(id)
        .then(response => {
          toast.success('Note deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete Note')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the Note!')
    }
  }

  const columns: Column[] = [
    {
      id: 'note_type',
      header: 'Note Type',
      cell: row => <span className='font-medium'>{row?.note_type?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'user',
      header: 'Noted By',
      cell: row => (
        <span className='font-medium'>{(row?.user?.first_name || '') + ' ' + (row?.user?.last_name || '')}</span>
      ),
      sortable: false
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: row => <span className='font-medium'>{row.subject || ''}</span>,
      sortable: true
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: row => <span className='font-medium'>{row.comment || ''}</span>,
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: row => <span className='font-medium'>{formatDate(row.created_at)}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton title='Edit' key='edit' variant='text' onClick={() => handleOpenEditModal(row.id)}/>,
            <DeleteButton title='Delete' key='delete' tooltip='Delete Note' variant='text' onClick={() => handleDeleteNote(row.id)} />
          ]}
        />
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({ searchable_id: clientId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')
    return filterKeys.length > 0
  }

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
        Add Note
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as LeadNote[]) || [],
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
        emptyMessage='No Note found'
      />

      <CreateOrEditNoteModal
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        clientId={clientId}
        noteTypes={noteTypes}
        note_id={selectedNoteId}
        note={selectedNote}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default LeadNotes
