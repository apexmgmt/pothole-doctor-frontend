import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProposalServiceItemPayload } from '@/types'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { Truck, BadgeDollarSign, ClipboardPlus, Trash2 } from 'lucide-react'

interface LineItemActionsProps {
  line: ProposalServiceItemPayload
  idx: number
  mode: 'create' | 'edit' | 'view'
  locked?: boolean
  updateLine: (idx: number, field: keyof ProposalServiceItemPayload, value: any) => void
  removeLine: (idx: number) => void
}

const LineItemActions = ({ line, idx, mode, locked = false, updateLine, removeLine }: LineItemActionsProps) => {
  const isDisabled = mode === 'view' || locked

  const hasFreight = (line.freight_charge ?? 0) > 0
  const hasDiscount = (line.discount ?? 0) > 0
  const hasNote = !!(line.note && line.note.trim() !== '')

  return (
    <td className='px-2 py-1 flex gap-1 justify-end'>
      {/* Freight charge dropdown */}
      {line.type === 'product' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='ghost' title='Freight Charge'>
              <Truck className={`h-4 w-4 ${hasFreight ? 'text-primary' : 'text-zinc-400'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-64 p-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-300'>Freight Charge</label>
              <Input
                type='number'
                value={line.freight_charge ?? 0}
                onChange={e => updateLine(idx, 'freight_charge', parseFloat(e.target.value) || 0)}
                placeholder='0.00'
                min={0}
                step={0.01}
                className='w-full'
                disabled={isDisabled}
              />
              <div className='text-xs text-zinc-400'>
                {line.product?.is_freight_percentage
                  ? `${Number(line.product?.freight_amount ?? 0)}% of total price (auto-calculated)`
                  : 'Enter freight charge'}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Discount button dropdown */}
      {line.type !== 'expense' && line.type !== 'deduction' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='ghost' title='Discount'>
              <BadgeDollarSign className={`h-4 w-4 ${hasDiscount ? 'text-primary' : 'text-zinc-400'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-64 p-3'>
            <div className='space-y-2'>
              <div className='flex gap-2'>
                <Button
                  variant={line.discount_type === 'percentage' ? 'default' : 'outline'}
                  size='sm'
                  disabled={isDisabled}
                  onClick={() => updateLine(idx, 'discount_type', 'percentage')}
                  className='flex-1'
                >
                  %
                </Button>
                <Button
                  variant={line.discount_type === 'fixed' ? 'default' : 'outline'}
                  size='sm'
                  disabled={isDisabled}
                  onClick={() => updateLine(idx, 'discount_type', 'fixed')}
                  className='flex-1'
                >
                  $
                </Button>
              </div>
              <Input
                disabled={isDisabled}
                type='number'
                value={Number(Number(line.discount ?? 0).toFixed(2))}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0
                  const discountType = line.discount_type ?? 'percentage'

                  const baseUnitPrice =
                    (line as any).margin >= 100 ? 0 : line.unit_cost / (1 - (line as any).margin / 100)

                  const lineTotal = baseUnitPrice * line.qty

                  if (discountType === 'percentage' && (value < 0 || value > 100)) return
                  if (discountType === 'fixed' && value > lineTotal) return

                  updateLine(idx, 'discount', value)
                }}
                placeholder={line.discount_type === 'fixed' ? 'Total amount' : '0-100'}
                min={0}
                max={line.discount_type === 'percentage' ? 100 : undefined}
                step={line.discount_type === 'percentage' ? 1 : 0.01}
              />
              <div className='text-xs text-zinc-400'>
                {line.discount_type === 'fixed' ? `Total discount off this line` : 'Enter 0-100%'}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Note Button with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost' title='Note'>
            <ClipboardPlus className={`h-4 w-4 ${hasNote ? 'text-primary' : 'text-zinc-400'}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-64 p-2'>
          <Textarea
            disabled={isDisabled}
            value={line.note || ''}
            onChange={e => updateLine(idx, 'note', e.target.value)}
            placeholder='Add note...'
            className='min-h-20'
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Button */}
      {!isDisabled && (
        <Button size='icon' variant='ghost' onClick={() => removeLine(idx)} title='Delete'>
          <Trash2 className='h-4 w-4 text-red-400' />
        </Button>
      )}
    </td>
  )
}

export default LineItemActions
