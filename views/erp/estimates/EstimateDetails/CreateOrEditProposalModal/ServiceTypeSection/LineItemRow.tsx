import { Fragment } from 'react'
import { Boxes, Box, Wrench, ClipboardIcon, GridIcon, Minus } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProposalServiceItemPayload, Unit, Vendor } from '@/types'
import { cn } from '@/lib/utils'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'
import LineItemActions from './LineItemActions'
import MaterialJobActionsRow from './MaterialJobActionsRow'

interface LineItemRowProps {
  line: ProposalServiceItemPayload
  idx: number
  mode: 'create' | 'edit' | 'view'
  isLocked: boolean
  hasActions: boolean
  showVendor: boolean
  showPurchaseQty: boolean
  hideMargin: boolean
  units: Unit[]
  vendors: Vendor[]
  getEditValue: (idx: number, field: string, fallback: string) => string
  setEditValue: (idx: number, field: string, value: string) => void
  clearEditValue: (idx: number, field: string) => void
  updateLine: (idx: number, field: keyof ProposalServiceItemPayload, value: any) => void
  updateLineFields: (idx: number, fields: Partial<ProposalServiceItemPayload>) => void
  removeLine: (idx: number) => void
  clampProductQty: (qty: number, line: ProposalServiceItemPayload) => number
}

const LineItemRow = ({
  line,
  idx,
  mode,
  isLocked,
  hasActions,
  showVendor,
  showPurchaseQty,
  hideMargin,
  units,
  vendors,
  getEditValue,
  setEditValue,
  clearEditValue,
  updateLine,
  updateLineFields,
  removeLine,
  clampProductQty
}: LineItemRowProps) => {
  const totalCost = line.unit_cost * line.qty
  const unitPrice = getDiscountedUnitPrice(line)
  const totalPrice = unitPrice * line.qty

  return (
    <Fragment>
      <tr className={cn('border-b border-zinc-800 align-top', line.type === 'deduction' && 'text-red-500')}>
        <td className='px-2 py-3'>{idx + 1}.</td>

        {/* Name */}
        <td className='px-2 py-1'>
          <div className='flex items-center gap-2'>
            {line.type === 'product' && line.product_id && <Boxes className='h-4 w-4 text-zinc-400' />}
            {line.type === 'product' && !line.product_id && <Box className='h-4 w-4 text-zinc-400' />}
            {line.type === 'labor' && <Wrench className='h-4 w-4 text-zinc-400' />}
            {line.type === 'expense' && <ClipboardIcon className='h-4 w-4 text-zinc-400' />}
            {line.type === 'invoice' && <GridIcon className='h-4 w-4 text-zinc-400' />}
            {line.type === 'deduction' && <Minus className='h-4 w-4 text-red-500' />}
            <Input
              value={getEditValue(idx, 'name', line.name ?? '')}
              onChange={e => setEditValue(idx, 'name', e.target.value)}
              onBlur={e => {
                updateLine(idx, 'name', e.target.value)
                clearEditValue(idx, 'name')
              }}
              className={cn('w-full min-w-32', line.type === 'deduction' && 'text-red-500')}
              placeholder='Item Name'
              disabled={isLocked}
            />
          </div>
        </td>

        {/* Description */}
        <td className='px-2 py-1'>
          <Input
            value={getEditValue(idx, 'description', line.description ?? '')}
            onChange={e => setEditValue(idx, 'description', e.target.value)}
            onBlur={e => {
              updateLine(idx, 'description', e.target.value)
              clearEditValue(idx, 'description')
            }}
            className='w-full min-w-32 text-red-500'
            placeholder='Empty'
            disabled={isLocked}
          />
        </td>

        {/* Vendor */}
        {showVendor && (
          <td className='px-2 py-1'>
            {line.type === 'product' && (
              <Select
                value={line.vendor_id || line.product?.vendor_id || ''}
                onValueChange={val => updateLine(idx, 'vendor_id', val)}
                disabled={isLocked || !!line.product_id}
              >
                <SelectTrigger className='w-36 text-xs'>
                  <SelectValue placeholder='Vendor' />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {[vendor.first_name, vendor.last_name].filter(Boolean).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </td>
        )}

        {/* Unit Cost */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && (
            <Input
              type='number'
              value={getEditValue(idx, 'unit_cost', String(line.unit_cost ?? 0))}
              onChange={e => setEditValue(idx, 'unit_cost', e.target.value)}
              onBlur={e => {
                updateLine(idx, 'unit_cost', parseFloat(e.target.value) || 0)
                clearEditValue(idx, 'unit_cost')
              }}
              className='w-28'
              min={0}
              disabled={isLocked}
            />
          )}
        </td>

        {/* Quantity */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && (
            <div className='flex flex-col gap-1'>
              <Input
                type='number'
                value={getEditValue(idx, 'qty', String(line.qty ?? 1))}
                onChange={e => setEditValue(idx, 'qty', e.target.value)}
                onBlur={e => {
                  const raw = parseFloat(e.target.value) || 0
                  const clamped = clampProductQty(raw, line)

                  updateLine(idx, 'qty', clamped)
                  clearEditValue(idx, 'qty')
                }}
                className='w-28 bg-yellow-200 text-black'
                min={0}
                disabled={isLocked}
              />
              {(line.type === 'product' || line.type === 'labor') &&
                (line.product_id || line.labor_cost_id ? (
                  <span className='text-xs text-zinc-400 px-1 truncate w-28' title={line.unit_name || '—'}>
                    {line.unit_name || '—'}
                    {showPurchaseQty && line.product_id && !!line.product?.coverage_per_rate && (
                      <span className='text-xs text-blue-400 px-1 truncate w-28'>
                        {(line.qty / line.product.coverage_per_rate).toFixed(2)}{' '}
                        {line.product.purchase_uom?.name ?? line.product.purchase_unit?.name ?? ''}
                      </span>
                    )}
                  </span>
                ) : (
                  <Select
                    value={line.unit_id ?? ''}
                    onValueChange={val => {
                      const unit = units.find(u => u.id === val)

                      updateLineFields(idx, { unit_id: val, unit_name: unit?.name ?? '' })
                    }}
                    disabled={isLocked}
                  >
                    <SelectTrigger className='w-28 h-6! text-xs'>
                      <SelectValue placeholder='Unit' />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>
          )}
        </td>

        {/* Total Cost */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && <Input value={totalCost.toFixed(2)} readOnly className='w-28' />}
        </td>

        {/* Margin */}
        {!hideMargin && (
          <td className='px-2 py-1 flex items-start gap-1'>
            {line.type !== 'deduction' && (
              <>
                <Input
                  type='number'
                  value={getEditValue(idx, 'margin', String(line.margin ?? 0))}
                  onChange={e => setEditValue(idx, 'margin', e.target.value)}
                  onBlur={e => {
                    updateLine(idx, 'margin', parseFloat(e.target.value) || 0)
                    clearEditValue(idx, 'margin')
                  }}
                  className='w-28'
                  min={0}
                  max={100}
                  disabled={isLocked}
                />
                <span>%</span>
              </>
            )}
          </td>
        )}

        {/* Unit Price */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && <Input value={unitPrice.toFixed(2)} readOnly className='w-28' />}
        </td>

        {/* Total Price */}
        <td className='px-2 py-1'>
          {line.type === 'deduction' ? (
            <Input
              disabled={isLocked}
              type='number'
              min={0}
              value={getEditValue(idx, 'total_price', Number(line.total_price)?.toFixed(2) ?? '')}
              onChange={e => setEditValue(idx, 'total_price', e.target.value)}
              onBlur={e => {
                updateLine(idx, 'total_price', parseFloat(e.target.value) || 0)
                clearEditValue(idx, 'total_price')
              }}
              className='w-28'
            />
          ) : (
            <Input value={totalPrice.toFixed(2)} readOnly className='w-28' />
          )}
        </td>

        {/* Sales Tax checkbox */}
        <td className='px-2 py-3.5 text-center'>
          {line.type !== 'deduction' && (
            <Checkbox
              disabled={isLocked}
              checked={line.is_sale === 1}
              onCheckedChange={checked => updateLine(idx, 'is_sale', checked ? 1 : 0)}
            />
          )}
        </td>

        {/* Actions dropdown */}
        <LineItemActions
          line={line}
          idx={idx}
          mode={mode}
          locked={hasActions}
          updateLine={updateLine}
          removeLine={removeLine}
        />

        <td className='hidden'>
          <input type='hidden' value={line.type || ''} readOnly />
        </td>
      </tr>

      {hasActions && (
        <MaterialJobActionsRow
          actions={line.material_job_actions ?? []}
          onActionsChange={updated => updateLine(idx, 'material_job_actions', updated)}
        />
      )}
    </Fragment>
  )
}

export default LineItemRow
