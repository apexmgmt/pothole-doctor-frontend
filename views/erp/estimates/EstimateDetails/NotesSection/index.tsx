import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StickyNote } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { EstimateNote } from '@/types'
import CreteEditNoteModal from './CreateEditNoteModal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EstimateNoteService from '@/services/api/estimates/estimate-notes.service'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { hasPermission } from '@/utils/role-permission'

const NotesSection = ({ estimateId, estimateNotes }: { estimateId: string; estimateNotes: EstimateNote[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const [canCreateEstimateNote, setCanCreateEstimateNote] = useState<boolean>(false)
  const [canEditEstimateNote, setCanEditEstimateNote] = useState<boolean>(false)
  const [canDeleteEstimateNote, setCanDeleteEstimateNote] = useState<boolean>(false)

  // Check permissions
  useEffect(() => {
    hasPermission('Create Estimate Note').then(result => setCanCreateEstimateNote(result))
    hasPermission('Update Estimate Note').then(result => setCanEditEstimateNote(result))
    hasPermission('Delete Estimate Note').then(result => setCanDeleteEstimateNote(result))
  }, [])

  // This function will be called after a successful edit
  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open)

    if (!open) {
      // Modal just closed, so refetch the data
      router.refresh()
    }
  }

  const handleNoteDelete = async (noteId: string) => {
    try {
      EstimateNoteService.destroy(noteId)
        .then(response => {
          toast.success('Note deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error('Failed to delete note')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the note!')
    }
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div className='flex items-center gap-2'>
            <StickyNote className='text-zinc-300 w-5 h-5' />
            <CardTitle className='text-white text-base'>Notes</CardTitle>
          </div>
          {canCreateEstimateNote && (
            <Button
              onClick={() => {
                setIsModalOpen(true)
              }}
              size='sm'
              variant='outline'
              className='text-xs px-3 py-1 flex items-center gap-1 text-black bg-white'
            >
              + Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {estimateNotes?.length === 0 && (
            <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md'>
              <span className='text-zinc-400 text-sm'>No Notes</span>
            </div>
          )}
          {estimateNotes?.length > 0 && (
            <ScrollArea className='h-[25vh] pr-2'>
              {estimateNotes.map((note, idx) => (
                <div key={idx} className='mb-4 relative'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='text-zinc-200 text-sm mb-2 text-wrap flex-1'>{note.comment}</div>
                    {canDeleteEstimateNote && (
                      <DeleteButton
                        onClick={() => handleNoteDelete(note.id)}
                        tooltip='Delete note'
                        confirmTitle='Delete Note'
                        confirmMessage='Are you sure you want to delete this note? This action cannot be undone.'
                        buttonSize='icon'
                        buttonVariant='ghost'
                      />
                    )}
                  </div>
                  <div className='flex items-center justify-between text-xs text-zinc-400 mb-2'>
                    <span>
                      Created by{' '}
                      <span className='font-semibold text-zinc-300'>
                        {note?.user?.first_name} {note?.user?.last_name}
                      </span>
                    </span>
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                  {idx < estimateNotes.length - 1 && <hr className='border-zinc-800' />}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <CreteEditNoteModal mode='create' isOpen={isModalOpen} onOpenChange={handleModalChange} estimateId={estimateId} />
    </>
  )
}

export default NotesSection
