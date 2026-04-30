import React, { useState, useEffect } from 'react'
import { StickyNoteIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ContractorNotesPopoverProps {
  notes: string | null
  onSave: (val: string) => void
  disabled?: boolean
}

export const ContractorNotesPopover = ({ notes, onSave, disabled }: ContractorNotesPopoverProps) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [draftNotes, setDraftNotes] = useState(notes ?? '')

  // Sync draft if the prop changes externally
  useEffect(() => {
    setDraftNotes(notes ?? '')
  }, [notes])

  const handleOk = () => {
    onSave(draftNotes)
    setIsNotesOpen(false)
  }

  const handleCancel = () => {
    setDraftNotes(notes ?? '')
    setIsNotesOpen(false)
  }

  return (
    <Popover open={isNotesOpen} onOpenChange={setIsNotesOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 text-xs border-amber-600/50 text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
        >
          <StickyNoteIcon className='h-3 w-3 mr-1' />
          Contractor Notes
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0 overflow-hidden' align='start'>
        <div className='p-3 space-y-3'>
          <Textarea
            value={draftNotes}
            onChange={e => setDraftNotes(e.target.value)}
            placeholder='Enter contractor notes...'
            className='min-h-[100px] text-sm bg-zinc-900 border-zinc-700 focus-visible:ring-amber-600/50'
            disabled={disabled}
          />
          <div className='flex justify-end gap-2 pt-2 border-t border-zinc-800'>
            <Button variant='ghost' size='sm' onClick={handleCancel} className='h-8 text-xs text-zinc-400'>
              Cancel
            </Button>
            <Button size='sm' onClick={handleOk} className='h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white'>
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
