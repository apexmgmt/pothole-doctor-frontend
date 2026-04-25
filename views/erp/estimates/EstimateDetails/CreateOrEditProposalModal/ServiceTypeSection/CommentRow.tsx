import { MessageSquareIcon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProposalServiceItemPayload } from '@/types'
import { cn } from '@/lib/utils'

interface CommentRowProps {
  line: ProposalServiceItemPayload
  idx: number
  isLocked: boolean
  showVendor: boolean
  hideMargin: boolean
  hidePriceColumns: boolean
  getEditValue: (idx: number, field: string, fallback: string) => string
  setEditValue: (idx: number, field: string, value: string) => void
  clearEditValue: (idx: number, field: string) => void
  updateLine: (idx: number, field: keyof ProposalServiceItemPayload, value: any) => void
  removeLine: (idx: number) => void
}

const CommentRow = ({
  line,
  idx,
  isLocked,
  showVendor,
  hideMargin,
  hidePriceColumns,
  getEditValue,
  setEditValue,
  clearEditValue,
  updateLine,
  removeLine
}: CommentRowProps) => {
  const totalColumns = 8 + (showVendor ? 1 : 0) + (hideMargin ? 0 : 1) + (hidePriceColumns ? 0 : 2)

  return (
    <tr className={cn('border-b border-zinc-800 bg-muted align-top')}>
      <td className='px-2 py-3'>{idx + 1}.</td>
      <td colSpan={totalColumns - 2} className='px-2 py-1 pr-8'>
        <div className='flex items-center gap-2'>
          <MessageSquareIcon className='h-4 w-4 text-zinc-400' />
          <Input
            value={getEditValue(idx, 'description', line.description ?? '')}
            onChange={e => setEditValue(idx, 'description', e.target.value)}
            onBlur={e => {
              updateLine(idx, 'description', e.target.value)
              clearEditValue(idx, 'description')
            }}
            className='w-full bg-muted'
            placeholder='Comment'
            disabled={isLocked}
          />
        </div>
      </td>
      <td className='px-2 py-1 flex justify-end gap-1'>
        {!isLocked && (
          <Button size='icon' variant='ghost' onClick={() => removeLine(idx)}>
            <Trash2 className='h-4 w-4 text-red-400' />
          </Button>
        )}
      </td>
      <td className='hidden'>
        <input type='hidden' value={line.type || ''} readOnly />
      </td>
    </tr>
  )
}

export default CommentRow
