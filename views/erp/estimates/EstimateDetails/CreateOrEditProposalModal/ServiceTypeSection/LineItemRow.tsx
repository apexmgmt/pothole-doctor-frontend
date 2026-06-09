import { Fragment } from 'react'
import { Boxes, Box, Wrench, ClipboardIcon, GridIcon, Minus } from 'lucide-react'

import CustomFormField from '@/components/form/CustomFormField'
import { ProposalServiceItemPayload, Unit, Vendor } from '@/types'
import { cn } from '@/lib/utils'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'
import LineItemActions from './LineItemActions'
import MaterialJobActionsRow from './MaterialJobActionsRow'
import { StylePopover, ColorPopover } from './StyleColorPopover'


interface LineItemRowProps {
  line: ProposalServiceItemPayload
  idx: number
  fieldErrors?: Record<string, string>
  mode: 'create' | 'edit' | 'view'
  isLocked: boolean
  hasActions: boolean
  showVendor: boolean
  showPurchaseQty: boolean
  hideMargin: boolean
  hidePriceColumns: boolean
  units: Unit[]
  vendors: Vendor[]
  getEditValue: (idx: number, field: string, fallback: string) => string
  setEditValue: (idx: number, field: string, value: string) => void
  clearEditValue: (idx: number, field: string) => void
  updateLine: (idx: number, field: keyof ProposalServiceItemPayload, value: any) => void
  updateLineFields: (idx: number, fields: Partial<ProposalServiceItemPayload>) => void
  removeLine: (idx: number) => void
  clampProductQty: (qty: number, line: ProposalServiceItemPayload) => number
  hideTaxOption?: boolean
  hideDiscountOption?: boolean
  showOrderAction?: boolean
  onOrderActionClick?: () => void
  showPurchaseOrderAction?: boolean
  onPurchaseOrderClick?: () => void
  showSkuStyleColor?: boolean
}

const LineItemRow = ({
  line,
  idx,
  fieldErrors,
  mode,
  isLocked,
  hasActions,
  showVendor,
  showPurchaseQty,
  hideMargin,
  hidePriceColumns,
  units,
  vendors,
  getEditValue,
  showSkuStyleColor = false,
  setEditValue,
  clearEditValue,
  updateLine,
  updateLineFields,
  removeLine,
  clampProductQty,
  hideTaxOption = false,
  hideDiscountOption = false,
  showOrderAction = false,
  onOrderActionClick,
  showPurchaseOrderAction = false,
  onPurchaseOrderClick
}: LineItemRowProps) => {
  const totalCost = line.unit_cost * line.qty
  const unitPrice = getDiscountedUnitPrice(line)
  const totalPrice = unitPrice * line.qty
  const materialJobOrderStatus = String((line as any)?.material_job?.order_status ?? '').toLowerCase()
  const showMaterialJobStatusRow = !!materialJobOrderStatus && !['new', 'pending'].includes(materialJobOrderStatus)

  return (
    <Fragment>
      <tr className={cn('border-t border-accent/40 align-top', line.type === 'deduction' && 'text-red-500')}>
        <td className='px-2 py-3'>{idx + 1}.</td>

        {/* Name */}
        <td className='px-2 py-1'>
          <div className='flex items-center gap-2'>
            {line.type === 'product' && line.product_id && <Boxes className='h-4 w-4 text-accent-foreground' />}
            {line.type === 'product' && !line.product_id && <Box className='h-4 w-4 text-accent-foreground' />}
            {line.type === 'labor' && <Wrench className='h-4 w-4 text-accent-foreground' />}
            {line.type === 'expense' && <ClipboardIcon className='h-4 w-4 text-accent-foreground' />}
            {line.type === 'invoice' && <GridIcon className='h-4 w-4 text-accent-foreground' />}
            {line.type === 'deduction' && <Minus className='h-4 w-4 text-red-500' />}
            <div className='w-full min-w-32'>
              <CustomFormField
                type='text'
                value={getEditValue(idx, 'name', line.name ?? '')}
                onChange={(val: any) => setEditValue(idx, 'name', val)}
                onBlur={() => {
                  updateLine(idx, 'name', getEditValue(idx, 'name', line.name ?? ''))
                  clearEditValue(idx, 'name')
                }}
                className={cn(
                  'w-full',
                  line.type === 'deduction' && 'text-red-500',
                  fieldErrors?.name && 'border-red-500 focus-visible:ring-red-500'
                )}
                placeholder='Item Name'
                disabled={isLocked}
              />
            </div>
          </div>
        </td>

        {/* Description */}
        <td className='px-2 py-1'>
          <div className='w-full min-w-32'>
            <CustomFormField
              type='text'
              value={getEditValue(idx, 'description', line.description ?? '')}
              onChange={(val: any) => setEditValue(idx, 'description', val)}
              onBlur={() => {
                updateLine(idx, 'description', getEditValue(idx, 'description', line.description ?? ''))
                clearEditValue(idx, 'description')
              }}
              className={cn('w-full', fieldErrors?.description && 'border-red-500 focus-visible:ring-red-500')}
              placeholder='Empty'
              disabled={isLocked}
            />
          </div>
        </td>

        {/* Vendor */}
        {showVendor && (
          <td className='px-2 py-1'>
            {line.type === 'product' && (
              <CustomFormField
                type='select'
                placeholder='Vendor'
                value={line.vendor_id || line.product?.vendor_id || ''}
                onChange={(val: any) => updateLine(idx, 'vendor_id', val)}
                disabled={isLocked || !!line.product_id}
                selectOptions={vendors.map(vendor => ({
                  value: vendor.id,
                  label: [vendor.first_name, vendor.last_name].filter(Boolean).join(' ')
                }))}
                className={cn('min-w-36 text-xs', fieldErrors?.vendor_id && 'border-red-500')}
              />
            )}
          </td>
        )}
        {showSkuStyleColor && line.type === 'product' ? (
          <>
            <td className='px-2 py-1'>{line?.sku ?? 'N/A'}</td>
            <td className='px-2 py-1'>
              {!line.product_id && !(line as any)?.product && !isLocked ? (
                <StylePopover
                  value={line?.style ?? ''}
                  onSave={style => {
                    updateLineFields(idx, { style })
                  }}
                  trigger={
                    <button className='text-left text-blue-400 hover:text-blue-500 cursor-pointer underline'>
                      {line?.style || 'N/A'}
                    </button>
                  }
                />
              ) : (
                <span>{line?.style ?? 'N/A'}</span>
              )}
            </td>
            <td className='px-2 py-1'>
              {!line.product_id && !(line as any)?.product && !isLocked ? (
                <ColorPopover
                  value={line?.color ?? ''}
                  onSave={color => {
                    updateLineFields(idx, { color })
                  }}
                  trigger={
                    <button className='text-left text-blue-400 hover:text-blue-500 cursor-pointer underline'>
                      {line?.color || 'N/A'}
                    </button>
                  }
                />
              ) : (
                <span>{line?.color ?? 'N/A'}</span>
              )}
            </td>
          </>
        ) : (
          showSkuStyleColor && (
            <>
              <td className='px-2 py-1'></td>
              <td className='px-2 py-1'></td>
              <td className='px-2 py-1'></td>
            </>
          )
        )}

        {/* Unit Cost */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && (
            <CustomFormField
              type='number'
              leftAddon='$'
              value={getEditValue(idx, 'unit_cost', String(line.unit_cost ?? 0))}
              onChange={(val: any) => setEditValue(idx, 'unit_cost', val)}
              onBlur={() => {
                updateLine(idx, 'unit_cost', parseFloat(getEditValue(idx, 'unit_cost', String(line.unit_cost ?? 0))) || 0)
                clearEditValue(idx, 'unit_cost')
              }}
              className={cn('min-w-28', fieldErrors?.unit_cost && 'border-red-500 focus-visible:ring-red-500')}
              disabled={isLocked}
            />
          )}
        </td>

        {/* Quantity */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && (
            <div className='flex flex-col gap-1'>
              <CustomFormField
                type='number'
                value={getEditValue(idx, 'qty', String(line.qty ?? 1))}
                onChange={(val: any) => setEditValue(idx, 'qty', val)}
                onBlur={() => {
                  const raw = parseFloat(getEditValue(idx, 'qty', String(line.qty ?? 1))) || 0
                  const clamped = clampProductQty(raw, line)

                  updateLine(idx, 'qty', clamped)
                  clearEditValue(idx, 'qty')
                }}
                className={cn(
                  'min-w-20 max-w-28',
                  fieldErrors?.qty && 'border-red-500 focus-visible:ring-red-500'
                )}
                disabled={isLocked}
              />
              {(line.type === 'product' || line.type === 'labor') &&
                (line.product_id || line.labor_cost_id ? (
                  <span className='text-xs text-accent-foreground px-1 truncate w-28' title={line.unit_name || '—'}>
                    {line.unit_name || '—'}
                    {line.product_id && !!line.product?.coverage_per_rate && (
                      <span className='text-xs text-blue-400 px-1 truncate w-28'>
                        {(line.qty / line.product.coverage_per_rate).toFixed(2)}{' '}
                        {line.product.purchase_uom?.name ?? line.product.purchase_unit?.name ?? ''}
                      </span>
                    )}
                  </span>
                ) : (
                  <CustomFormField
                    type='select'
                    placeholder='Unit'
                    value={line.unit_id ?? ''}
                    onChange={(val: any) => {
                      const unit = units.find(u => u.id === val)

                      updateLineFields(idx, { unit_id: val, unit_name: unit?.name ?? '' })
                    }}
                    disabled={isLocked}
                    selectOptions={units.map(unit => ({
                      value: unit.id,
                      label: unit.name
                    }))}
                    className={cn('min-w-20 h-6! text-xs', fieldErrors?.unit_id && 'border-red-500')}
                  />
                ))}
            </div>
          )}
        </td>

        {/* Total Cost */}
        <td className='px-2 py-1'>
          {line.type !== 'deduction' && (
            <CustomFormField
              type='text'
              leftAddon='$'
              value={totalCost.toFixed(2)}
              readonly
              className='min-w-28'
            />
          )}
        </td>

        {/* Margin */}
        {!hideMargin && (
          <td className='px-2 py-1'>
            {line.type !== 'deduction' && (
              <CustomFormField
                type='number'
                rightAddon='%'
                value={getEditValue(idx, 'margin', String(line.margin ?? 0))}
                onChange={(val: any) => setEditValue(idx, 'margin', val)}
                onBlur={() => {
                  updateLine(idx, 'margin', parseFloat(getEditValue(idx, 'margin', String(line.margin ?? 0))) || 0)
                  clearEditValue(idx, 'margin')
                }}
                className={cn('min-w-28', fieldErrors?.margin && 'border-red-500 focus-visible:ring-red-500')}
                disabled={isLocked}
              />
            )}
          </td>
        )}

        {!hidePriceColumns && (
          <>
            {/* Unit Price */}
            <td className='px-2 py-1'>
              {line.type !== 'deduction' && (
                <CustomFormField
                  type='text'
                  leftAddon='$'
                  value={unitPrice.toFixed(2)}
                  readonly
                  className='min-w-28'
                />
              )}
            </td>

            {/* Total Price */}
            <td className='px-2 py-1'>
              {line.type === 'deduction' ? (
                <CustomFormField
                  type='number'
                  leftAddon='$'
                  value={getEditValue(idx, 'total_price', Number(line.total_price)?.toFixed(2) ?? '')}
                  onChange={(val: any) => setEditValue(idx, 'total_price', val)}
                  onBlur={() => {
                    updateLine(idx, 'total_price', parseFloat(getEditValue(idx, 'total_price', Number(line.total_price)?.toFixed(2) ?? '')) || 0)
                    clearEditValue(idx, 'total_price')
                  }}
                  disabled={isLocked}
                  className={cn('min-w-28', fieldErrors?.total_price && 'border-red-500 focus-visible:ring-red-500')}
                />
              ) : (
                <CustomFormField
                  type='text'
                  leftAddon='$'
                  value={totalPrice.toFixed(2)}
                  readonly
                  className='min-w-28'
                />
              )}
            </td>
          </>
        )}

        {/* Sales Tax checkbox */}

        {!hideTaxOption && (
          <td className='px-2 py-3.5 text-center'>
            {line.type !== 'deduction' && (
              <CustomFormField
                type='checkbox'
                disabled={isLocked}
                value={line.is_sale ? true : false}
                onChange={(checked: any) => updateLine(idx, 'is_sale', checked ? 1 : 0)}
              />
            )}
          </td>
        )}

        {/* Actions dropdown */}
        <LineItemActions
          line={line}
          idx={idx}
          mode={mode}
          locked={hasActions}
          updateLine={updateLine}
          removeLine={removeLine}
          hideDiscountOption={hideDiscountOption}
          showOrderAction={showOrderAction}
          onOrderActionClick={onOrderActionClick}
          showPurchaseOrderAction={showPurchaseOrderAction}
          onPurchaseOrderClick={onPurchaseOrderClick}
        />

        <td className='hidden'>
          <input type='hidden' value={line.type || ''} readOnly />
        </td>
      </tr>

      {(hasActions || showMaterialJobStatusRow) && (
        <MaterialJobActionsRow
          actions={line.material_job_actions ?? []}
          onActionsChange={updated => updateLine(idx, 'material_job_actions', updated)}
          orderStatus={(line as any)?.material_job?.order_status ?? null}
          orderNumber={(line as any)?.material_job?.order_number ?? null}
        />
      )}
    </Fragment>
  )
}

export default LineItemRow
