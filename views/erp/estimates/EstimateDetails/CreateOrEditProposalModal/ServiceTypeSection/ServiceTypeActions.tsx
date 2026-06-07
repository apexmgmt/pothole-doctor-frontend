import CustomFormField from '@/components/form/CustomFormField'
import { Button } from '@/components/ui/button'
import { Boxes, Wrench, GridIcon, ClipboardIcon, MessageSquareIcon, Minus, Box } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ProposalServiceItemPayload } from '@/types'

interface ServiceTypeActionsProps {
  mode: 'create' | 'edit' | 'view'
  documentTypeName?: string | null
  margin: string
  setMargin: (v: string) => void
  lines: any[]
  recalculateLine: (line: any) => any
  onLinesChange: (lines: any[]) => void
  setOpenProductsModal: (open: boolean) => void
  setOpenNonInventoryProductsModal: (open: boolean) => void
  setOpenLaborCostModal: (open: boolean) => void
  addLine: (type: ProposalServiceItemPayload['type']) => void
  hideMargin?: boolean
  allowedLineTypes?: ProposalServiceItemPayload['type'][]
}

const ServiceTypeActions = ({
  mode,
  documentTypeName,
  margin,
  setMargin,
  lines,
  recalculateLine,
  onLinesChange,
  setOpenProductsModal,
  setOpenNonInventoryProductsModal,
  setOpenLaborCostModal,
  addLine,
  hideMargin = false,
  allowedLineTypes
}: ServiceTypeActionsProps) => {
  const isAllowed = (type: ProposalServiceItemPayload['type']) =>
    !allowedLineTypes || allowedLineTypes.includes(type)

  const normalizedDocumentType = (documentTypeName || '').trim().toLowerCase()
  const hideLaborActions = normalizedDocumentType === 'material only'
  const hideMaterialActions = normalizedDocumentType === 'labor only'

  return (
  <div className='flex items-center gap-2 bg-accent/40 p-3 rounded-xl border border-accent'>
    {mode !== 'view' && !hideMargin && (
      <div className='flex items-center gap-2 flex-1'>
        <span className='text-sm text-nowrap font-medium text-zinc-300'>% Margin:</span>
        <CustomFormField
          type='number'
          value={margin}
          onChange={(val: any) => setMargin(val)}
          className='w-24 bg-zinc-900 border-zinc-700'
          fieldClassName='w-auto'
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
          <span className='text-accent-foreground'>↻</span>
        </Button>
      </div>
    )}

    {/* Action Buttons */}
    {mode !== 'view' && (
      <div className='flex items-center gap-1 ml-auto'>
        {!hideMaterialActions && isAllowed('product') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-accent-foreground' title='Add products'>
                <Boxes className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem onClick={() => setOpenProductsModal(true)}>
                <Boxes className='mr-2 h-4 w-4' /> Inventory Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenNonInventoryProductsModal(true)}>
                <Box className='mr-2 h-4 w-4' /> Non-Inventory Products
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!hideLaborActions && isAllowed('labor') && (
          <Button
            onClick={() => setOpenLaborCostModal(true)}
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 text-accent-foreground'
          >
            <Wrench className='h-4 w-4' />
          </Button>
        )}
        <Button asChild variant='outline' size='sm' className='h-8 px-3 text-xs'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>Add Line Item</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {isAllowed('invoice') && (
                <DropdownMenuItem onClick={() => addLine('invoice')}>
                  <GridIcon className='mr-2 h-4 w-4' /> Add Quote/Invoice Line Item
                </DropdownMenuItem>
              )}
              {isAllowed('product') && !hideMaterialActions && (
                <DropdownMenuItem onClick={() => addLine('product')}>
                  <Boxes className='mr-2 h-4 w-4' /> Add Material Line Item
                </DropdownMenuItem>
              )}
              {isAllowed('labor') && !hideLaborActions && (
                <DropdownMenuItem onClick={() => addLine('labor')}>
                  <Wrench className='mr-2 h-4 w-4' /> Add Labor Line Item
                </DropdownMenuItem>
              )}
              {isAllowed('expense') && (
                <DropdownMenuItem onClick={() => addLine('expense')}>
                  <ClipboardIcon className='mr-2 h-4 w-4' /> Add Expense Line Item
                </DropdownMenuItem>
              )}
              {isAllowed('comment') && (
                <DropdownMenuItem onClick={() => addLine('comment')}>
                  <MessageSquareIcon className='mr-2 h-4 w-4' /> Add Comment Line Item
                </DropdownMenuItem>
              )}
              {isAllowed('deduction') && (
                <DropdownMenuItem onClick={() => addLine('deduction')}>
                  <Minus className='mr-2 h-4 w-4' /> Add Deduction Line Item
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </Button>
      </div>
    )}
  </div>
  )
}

export default ServiceTypeActions
