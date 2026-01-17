import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Boxes, Wrench, GridIcon, ClipboardIcon, MessageSquareIcon, Minus } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ProposalServiceItemPayload } from '@/types'

interface ServiceTypeActionsProps {
  mode: 'create' | 'edit' | 'view'
  margin: string
  setMargin: (v: string) => void
  lines: any[]
  recalculateLine: (line: any) => any
  onLinesChange: (lines: any[]) => void
  setOpenProductsModal: (open: boolean) => void
  setOpenLaborCostModal: (open: boolean) => void
  addLine: (type: ProposalServiceItemPayload['type']) => void
}

const ServiceTypeActions = ({
  mode,
  margin,
  setMargin,
  lines,
  recalculateLine,
  onLinesChange,
  setOpenProductsModal,
  setOpenLaborCostModal,
  addLine
}: ServiceTypeActionsProps) => (
  <div className='flex items-center gap-2 bg-zinc-800 p-3 rounded-md'>
    {mode !== 'view' && (
      <div className='flex items-center gap-2 flex-1'>
        <span className='text-sm font-medium text-zinc-300'>% Margin:</span>
        <Input
          type='number'
          value={margin}
          onChange={e => setMargin(e.target.value)}
          className='w-24 h-8 bg-zinc-900 border-zinc-700'
          min={0}
          max={100}
        />
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          onClick={() => {
            const marginValue = parseFloat(margin) || 0

            const updated = lines.map(line =>
              line.type !== 'deduction' && line.type !== 'comment'
                ? recalculateLine({ ...line, margin: marginValue })
                : line
            )

            onLinesChange(updated)
          }}
        >
          <span className='text-zinc-400'>↻</span>
        </Button>
      </div>
    )}

    {/* Action Buttons */}
    {mode !== 'view' && (
      <div className='flex items-center gap-1'>
        <Button
          onClick={() => setOpenProductsModal(true)}
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 text-zinc-400'
        >
          <Boxes className='h-4 w-4' />
        </Button>
        <Button
          onClick={() => setOpenLaborCostModal(true)}
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 text-zinc-400'
        >
          <Wrench className='h-4 w-4' />
        </Button>
        <Button asChild variant='outline' size='sm' className='h-8 px-3 text-xs'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>Add Line Item</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => addLine('invoice')}>
                <GridIcon className='mr-2 h-4 w-4' /> Add Quote/Invoice Line Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine('product')}>
                <Boxes className='mr-2 h-4 w-4' /> Add Material Line Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine('labor')}>
                <Wrench className='mr-2 h-4 w-4' /> Add Labor Line Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine('expense')}>
                <ClipboardIcon className='mr-2 h-4 w-4' /> Add Expense Line Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine('comment')}>
                <MessageSquareIcon className='mr-2 h-4 w-4' /> Add Comment Line Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine('deduction')}>
                <Minus className='mr-2 h-4 w-4' /> Add Deduction Line Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Button>
      </div>
    )}
  </div>
)

export default ServiceTypeActions
