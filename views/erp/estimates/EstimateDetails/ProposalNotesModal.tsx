'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import CommonTable from '@/components/erp/common/table'
import ProposalNoteService from '@/services/api/estimates/proposal-notes.service'
import { ClientNote, Column } from '@/types'
import { formatDate } from '@/utils/date'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ProposalAddNoteModal from './ProposalAddNoteModal'

const ProposalNotesModal = ({
  open,
  onOpenChange,
  proposalId,
  clientId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  clientId?: string
}) => {
  const [notes, setNotes] = useState<ClientNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiMeta, setApiMeta] = useState<any>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ per_page: 10, page: 1 })

  // Add note state
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null)
  const [isFetchingNote, setIsFetchingNote] = useState(false)

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<ClientNote | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchNotes = async (filters = filterOptions) => {
    setIsLoading(true)

    try {
      const response = await ProposalNoteService.index(proposalId, filters)

      if (response.data) {
        setNotes(response.data.data || response.data)
        setApiMeta(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch proposal notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && proposalId) {
      fetchNotes(filterOptions)
    }
  }, [open, proposalId, filterOptions])

  const handleOpenEdit = async (note: ClientNote) => {
    setIsFetchingNote(true)

    try {
      const response = await ProposalNoteService.show(proposalId, note.id)
      const noteDetails = response.data || response

      setSelectedNote(noteDetails)
      setIsEditModalOpen(true)
    } catch {
      toast.error('Failed to load note details')
    } finally {
      setIsFetchingNote(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return
    setIsDeleting(true)

    try {
      await ProposalNoteService.destroy(proposalId, noteToDelete.id)
      toast.success('Note deleted successfully')
      setIsDeleteDialogOpen(false)
      setNoteToDelete(null)
      fetchNotes(filterOptions)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete note')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column[] = [
    {
      id: 'note_type',
      header: 'Note Type',
      cell: (row: ClientNote) => <span className='font-medium'>{row.note_type?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: (row: ClientNote) => <span className='font-medium'>{row.subject || '—'}</span>,
      sortable: true
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: (row: ClientNote) => (
        <span className='text-muted-foreground text-sm line-clamp-2'>{row.comment || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'user',
      header: 'Noted By',
      cell: (row: ClientNote) => <span>{row.user ? `${row.user.first_name} ${row.user.last_name}` : '—'}</span>,
      sortable: false
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: (row: ClientNote) => <span>{formatDate(row.created_at) || '—'}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Actions',
      headerAlign: 'center',
      size: 80,
      sortable: false,
      cell: (row: ClientNote) => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Note' variant='icon' onClick={() => handleOpenEdit(row)} />
          <DeleteButton
            tooltip='Delete Note'
            variant='icon'
            onClick={() => {
              setNoteToDelete(row)
              setIsDeleteDialogOpen(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <>
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Proposal Notes'
        description='All notes linked to this proposal.'
        maxWidth='7xl'
        isLoading={isFetchingNote}
        loadingMessage='Loading note details...'
        actions={
          <div className='flex gap-3'>
            <Button variant='default' size='sm' onClick={() => setIsAddNoteOpen(true)}>
              + Add Note
            </Button>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        }
      >
        <CommonTable
          data={{
            data: notes,
            per_page: apiMeta?.per_page ?? filterOptions.per_page,
            total: apiMeta?.total ?? notes.length,
            from: apiMeta?.from ?? 1,
            to: apiMeta?.to ?? notes.length,
            current_page: apiMeta?.current_page ?? 1,
            last_page: apiMeta?.last_page ?? 1
          }}
          columns={columns}
          setFilterOptions={setFilterOptions}
          showFilters={false}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No notes found for this proposal'
        />
      </CommonDialog>

      {/* Add note modal */}
      <ProposalAddNoteModal
        open={isAddNoteOpen}
        onOpenChange={open => setIsAddNoteOpen(open)}
        proposalId={proposalId}
        clientId={clientId}
        mode='create'
        onSuccess={() => {
          setIsAddNoteOpen(false)
          fetchNotes(filterOptions)
        }}
      />

      {/* Edit note modal */}
      {selectedNote && (
        <ProposalAddNoteModal
          open={isEditModalOpen}
          onOpenChange={open => {
            setIsEditModalOpen(open)
            if (!open) setSelectedNote(null)
          }}
          proposalId={proposalId}
          clientId={clientId}
          mode='edit'
          noteId={selectedNote.id}
          noteDetails={selectedNote}
          onSuccess={() => {
            setIsEditModalOpen(false)
            setSelectedNote(null)
            fetchNotes(filterOptions)
          }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open)
          if (!open) setNoteToDelete(null)
        }}
        title='Delete Note'
        message={`Are you sure you want to delete the note "${noteToDelete?.subject}"? This action cannot be undone.`}
        confirmButtonTitle='Delete'
        confirmButtonProps={{ className: 'bg-red-600 hover:bg-red-700 text-white' }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  )
}

export default ProposalNotesModal
