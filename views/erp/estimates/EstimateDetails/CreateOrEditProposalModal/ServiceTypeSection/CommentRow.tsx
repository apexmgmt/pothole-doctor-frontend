import { MessageSquareIcon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'
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
  showSkuStyleColor?: boolean
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
  removeLine,
  showSkuStyleColor=false
}: CommentRowProps) => {
  const totalColumns = 8 + (showVendor ? 1 : 0) + (hideMargin ? 0 : 1) + (hidePriceColumns ? 0 : 2) + (showSkuStyleColor ? 3 : 0)

  return (
    <tr className={cn('bg-accent/20 align-top')}>
      <td className='px-2 py-4.5 '>{idx + 1}.</td>
      <td colSpan={totalColumns - 3} className='px-2 py-3 '>
        <div className='flex items-center gap-2'>
          <MessageSquareIcon className='h-4 w-4 text-accent-foreground' />
          <CustomFormField
            type='text'
            value={getEditValue(idx, 'description', line.description ?? '')}
            onChange={(val: any) => setEditValue(idx, 'description', val)}
            onBlur={() => {
              updateLine(idx, 'description', getEditValue(idx, 'description', line.description ?? ''))
              clearEditValue(idx, 'description')
            }}
            className='w-full'
            placeholder='Comment'
            disabled={isLocked}
          />
        </div>
      </td>
      <td></td>
      <td className='px-2 py-3 flex justify-end gap-1'>
        {!isLocked && (
          <Button size='icon' variant='ghost' onClick={() => removeLine(idx)} className='h-7'>
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
