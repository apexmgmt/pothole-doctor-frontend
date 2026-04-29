'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import CommonTable from '@/components/erp/common/table'
import InvoiceNoteService from '@/services/api/invoices/invoice-notes.service'
import { ClientNote, Column } from '@/types'
import { formatDate } from '@/utils/date'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import InvoiceAddNoteModal from './InvoiceAddNoteModal'

const InvoiceNotesModal = ({
  open,
  onOpenChange,
  invoiceId,
  clientId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  clientId?: string
}) => {
  const [notes, setNotes] = useState<ClientNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiMeta, setApiMeta] = useState<any>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ per_page: 10, page: 1 })

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null)
  const [isFetchingNote, setIsFetchingNote] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<ClientNote | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchNotes = async (filters = filterOptions) => {
    setIsLoading(true)

    try {
      const response = await InvoiceNoteService.index(invoiceId, filters)

      if (response.data) {
        setNotes(response.data.data || response.data)
        setApiMeta(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch invoice notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && invoiceId) {
      fetchNotes(filterOptions)
    }
  }, [open, invoiceId, filterOptions])

  const handleOpenEdit = async (note: ClientNote) => {
    setIsFetchingNote(true)

    try {
      const response = await InvoiceNoteService.show(invoiceId, note.id)
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
      await InvoiceNoteService.destroy(invoiceId, noteToDelete.id)
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
        title='Invoice Notes'
        description='All notes linked to this invoice.'
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
          emptyMessage='No notes found for this invoice'
        />
      </CommonDialog>

      <InvoiceAddNoteModal
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        invoiceId={invoiceId}
        clientId={clientId}
        mode='create'
        onSuccess={() => {
          setIsAddNoteOpen(false)
          fetchNotes(filterOptions)
        }}
      />

      {selectedNote && (
        <InvoiceAddNoteModal
          open={isEditModalOpen}
          onOpenChange={open => {
            setIsEditModalOpen(open)
            if (!open) setSelectedNote(null)
          }}
          invoiceId={invoiceId}
          mode='edit'
          noteId={selectedNote.id}
          noteDetails={selectedNote}
          clientId={selectedNote.client_id}
          onSuccess={() => {
            setIsEditModalOpen(false)
            setSelectedNote(null)
            fetchNotes(filterOptions)
          }}
        />
      )}

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

export default InvoiceNotesModal
