import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'
import { ProposalServiceItemPayload } from '@/types'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { Truck, BadgeDollarSign, ClipboardPlus, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react'

interface LineItemActionsProps {
  line: ProposalServiceItemPayload
  idx: number
  mode: 'create' | 'edit' | 'view'
  locked?: boolean
  updateLine: (idx: number, field: keyof ProposalServiceItemPayload, value: any) => void
  removeLine: (idx: number) => void
  hideDiscountOption?: boolean
  showOrderAction?: boolean
  onOrderActionClick?: () => void
  showPurchaseOrderAction?: boolean
  onPurchaseOrderClick?: () => void
}

const LineItemActions = ({
  line,
  idx,
  mode,
  locked = false,
  updateLine,
  removeLine,
  hideDiscountOption = false,
  showOrderAction = false,
  onOrderActionClick,
  showPurchaseOrderAction = false,
  onPurchaseOrderClick
}: LineItemActionsProps) => {
  const isDisabled = mode === 'view' || locked

  const hasFreight = (line.freight_charge ?? 0) > 0
  const hasDiscount = (line.discount ?? 0) > 0
  const hasNote = !!(line.note && line.note.trim() !== '')
  const materialJobStatus = String((line as any)?.material_job?.order_status ?? '').toLowerCase()
  const hasProgressedMaterialJob = !!materialJobStatus && !['new', 'pending'].includes(materialJobStatus)

  return (
    <td className='px-2 py-1 flex gap-1 justify-end'>
      {/* Freight charge dropdown */}
      {line.type === 'product' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='ghost' title='Freight Charge'>
              <Truck className={`h-4 w-4 ${hasFreight ? 'text-primary' : 'text-accent-foreground'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-64 p-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-300'>Freight Charge</label>
              <CustomFormField
                type='number'
                value={line.freight_charge ?? 0}
                onChange={(val: any) => updateLine(idx, 'freight_charge', parseFloat(val) || 0)}
                placeholder='0.00'
                className='w-full'
                disabled={isDisabled}
              />
              <div className='text-xs text-accent-foreground'>
                {line.product?.is_freight_percentage
                  ? `${Number(line.product?.freight_amount ?? 0)}% of total price (auto-calculated)`
                  : 'Enter freight charge'}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Discount button dropdown */}
      {!hideDiscountOption && line.type !== 'expense' && line.type !== 'deduction' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='ghost' title='Discount'>
              <BadgeDollarSign className={`h-4 w-4 ${hasDiscount ? 'text-primary' : 'text-accent-foreground'}`} />
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
              <CustomFormField
                disabled={isDisabled}
                type='number'
                value={Number(Number(line.discount ?? 0).toFixed(2))}
                onChange={(val: any) => {
                  const value = parseFloat(val) || 0
                  const discountType = line.discount_type ?? 'percentage'

                  const baseUnitPrice =
                    (line as any).margin >= 100 ? 0 : line.unit_cost / (1 - (line as any).margin / 100)

                  const lineTotal = baseUnitPrice * line.qty

                  if (discountType === 'percentage' && (value < 0 || value > 100)) return
                  if (discountType === 'fixed' && value > lineTotal) return

                  updateLine(idx, 'discount', value)
                }}
                placeholder={line.discount_type === 'fixed' ? 'Total amount' : '0-100'}
              />
              <div className='text-xs text-accent-foreground'>
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
            <ClipboardPlus className={`h-4 w-4 ${hasNote ? 'text-primary' : 'text-accent-foreground'}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-64 p-2'>
          <CustomFormField
            type='textarea'
            disabled={isDisabled}
            value={line.note || ''}
            onChange={(val: any) => updateLine(idx, 'note', val)}
            placeholder='Add note...'
            className='min-h-20'
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Order Material Job */}
      {showOrderAction && onOrderActionClick && (
        <Button size='icon' variant='ghost' onClick={onOrderActionClick} title='Update Material Order'>
          <ShoppingCart className={`h-4 w-4 ${hasProgressedMaterialJob ? 'text-primary' : 'text-accent-foreground'}`} />
        </Button>
      )}

      {/* Create Purchase Order */}
      {showPurchaseOrderAction && onPurchaseOrderClick && (
        <Button size='icon' variant='ghost' onClick={onPurchaseOrderClick} title='Create Purchase Order'>
          <ShoppingBag className='h-4 w-4' />
        </Button>
      )}

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
