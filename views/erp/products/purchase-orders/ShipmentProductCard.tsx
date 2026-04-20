'use client'

import { PlusIcon, Trash2Icon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessLocation, Warehouse } from '@/types'

import { ProductRowState, ReceiptRowState } from './shipment-arrival.types'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ShipmentProductCardProps {
  product: ProductRowState
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  onCompanyCostChange: (id: string, value: number) => void
  onWorkOrderCostChange: (id: string, value: number) => void
  onCustomerPriceChange: (id: string, value: number) => void
  onMarginChange: (id: string, value: number) => void
  onAddReceipt: (id: string) => void
  onRemoveReceipt: (id: string, index: number) => void
  onUpdateReceipt: (id: string, index: number, updates: Partial<ReceiptRowState>) => void
  viewOnly?: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ShipmentProductCard = ({
  product: p,
  warehouses,
  businessLocations,
  onCompanyCostChange,
  onWorkOrderCostChange,
  onCustomerPriceChange,
  onMarginChange,
  onAddReceipt,
  onRemoveReceipt,
  onUpdateReceipt,
  viewOnly = false
}: ShipmentProductCardProps) => {
  const totalCoverage =
    p.coverage_per_rate != null ? Number((p.ordered_quantity * p.coverage_per_rate).toFixed(2)) : null

  const totalReceived = p.receipts.reduce((sum, r) => sum + (r.received_quantity || 0), 0)
  const productTotalAmount = p.company_cost * totalReceived
  const isQuantityExceeded = totalReceived > p.ordered_quantity

  return (
    <Card className='overflow-hidden'>
      {/* Product header */}
      <div className='flex items-center gap-2 px-4 py-2 bg-border/20 border-b border-border'>
        <span className='font-medium text-sm'>{p.product_name}</span>
      </div>

      {/* Product fields table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm min-w-[800px]'>
          <thead>
            <tr className='border-b border-border bg-border/10'>
              <th className='text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap'>Quantity</th>
              <th className='text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap'>Coverage</th>
              <th className='text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap'>Company Cost</th>
              <th className='text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap'>
                Work Order Cost
              </th>
              <th className='text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap'>
                Customer Price
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* Quantity */}
              <td className='px-3 py-3 align-top'>
                <div className='text-xs text-muted-foreground mb-1'>Ordered Quantity:</div>
                <div className='font-medium'>{p.ordered_quantity}</div>
              </td>

              {/* Coverage */}
              <td className='px-3 py-3 align-top'>
                {totalCoverage != null ? (
                  <div className='flex items-center gap-1'>
                    <span>{totalCoverage}</span>
                    <span className='text-xs text-muted-foreground'>{p.coverage_unit_name}</span>
                  </div>
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </td>

              {/* Company Cost */}
              <td className='px-3 py-3 align-top'>
                <div className='flex items-center gap-1'>
                  <Input
                    type='number'
                    min={0}
                    step='any'
                    value={p.company_cost}
                    onChange={e => onCompanyCostChange(p.id, Number(e.target.value))}
                    className='h-7 text-xs w-24'
                    disabled={viewOnly}
                  />
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>{p.purchase_unit_name}</span>
                </div>
              </td>

              {/* Work Order Cost */}
              <td className='px-3 py-3 align-top'>
                <div className='flex items-center gap-1'>
                  <Input
                    type='number'
                    min={0}
                    step='any'
                    value={p.work_order_cost}
                    onChange={e => onWorkOrderCostChange(p.id, Number(e.target.value))}
                    className='h-7 text-xs w-24'
                    disabled={viewOnly}
                  />
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>{p.purchase_unit_name}</span>
                </div>
              </td>

              {/* Customer Price — 3 stacked inputs */}
              <td className='px-3 py-3 align-top'>
                <div className='space-y-1'>
                  {/* customer_price (editable) */}
                  <div className='flex items-center gap-1'>
                    <Input
                      type='number'
                      min={0}
                      step='any'
                      value={p.customer_price}
                      onChange={e => onCustomerPriceChange(p.id, Number(e.target.value))}
                      className='h-7 text-xs w-24'
                      disabled={viewOnly}
                    />
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>{p.selling_unit_name}</span>
                  </div>
                  {/* product selling_price (read-only) */}
                  <div className='flex items-center gap-1'>
                    <div className='h-7 flex items-center px-2 rounded-md border border-border bg-muted text-xs w-24 text-muted-foreground'>
                      {p.product_selling_price.toFixed(2)}
                    </div>
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>{p.selling_unit_name}</span>
                  </div>
                  {/* margin (editable) */}
                  <div className='flex items-center gap-1'>
                    <Input
                      type='number'
                      min={0}
                      max={99.99}
                      step='any'
                      value={p.margin}
                      onChange={e => onMarginChange(p.id, Number(e.target.value))}
                      className='h-7 text-xs w-24'
                      disabled={viewOnly}
                    />
                    <span className='text-xs text-muted-foreground'>%</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Receiving Information */}
      <div className='border-t border-border'>
        <div className='px-4 py-2 bg-border/10 border-b border-border'>
          <span className='text-sm font-medium'>Receiving Information</span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-xs min-w-[900px]'>
            <thead>
              <tr className='border-b border-border bg-border/5'>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-28'>
                  Received Qty
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-36'>
                  Received Date
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-32'>
                  Warehouse Type
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-40'>
                  Warehouse
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-28'>
                  Stock Area
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-28'>
                  Stock Section
                </th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground whitespace-nowrap w-24'>
                  Dye Lot
                </th>
                <th className='px-2 py-2 w-8'>
                  {!viewOnly && (
                    <button
                      type='button'
                      title='Add receipt row'
                      onClick={() => onAddReceipt(p.id)}
                      className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                    >
                      <PlusIcon className='w-3 h-3' />
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {p.receipts.map((r, rIdx) => {
                const locked = r.is_moved_to_inventory

                return (
                  <tr
                    key={rIdx}
                    className={`border-b border-border last:border-0 ${locked ? 'opacity-70 ring-1 ring-destructive/40 bg-destructive/5' : ''}`}
                  >
                    <td className='px-2 py-2'>
                      <Input
                        type='number'
                        min={0}
                        step='any'
                        value={r.received_quantity}
                        disabled={locked || viewOnly}
                        onChange={e => onUpdateReceipt(p.id, rIdx, { received_quantity: Number(e.target.value) })}
                        className=' w-20'
                      />
                    </td>
                    <td className='px-2 py-2'>
                      <DatePicker
                        value={r.received_date}
                        onChange={v => onUpdateReceipt(p.id, rIdx, { received_date: v })}
                        placeholder='Date'
                        disabled={locked || viewOnly}
                        className=''
                      />
                    </td>
                    <td className='px-2 py-2'>
                      <Select
                        value={r.warehouse_type}
                        onValueChange={v =>
                          onUpdateReceipt(p.id, rIdx, {
                            warehouse_type: v as 'warehouse' | 'location',
                            warehouse_id: ''
                          })
                        }
                        disabled={locked || viewOnly}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='warehouse'>Warehouse</SelectItem>
                          <SelectItem value='location'>Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className='px-2 py-2'>
                      <Select
                        value={r.warehouse_id}
                        onValueChange={v => onUpdateReceipt(p.id, rIdx, { warehouse_id: v })}
                        disabled={locked || viewOnly}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                          {r.warehouse_type === 'warehouse'
                            ? warehouses.map(w => (
                                <SelectItem key={w.id} value={w.id}>
                                  {w.title}
                                </SelectItem>
                              ))
                            : businessLocations.map(bl => (
                                <SelectItem key={bl.id} value={bl.id}>
                                  {bl.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className='px-2 py-2'>
                      {/* <Input
                        value={r.stock_area}
                        disabled={locked}
                        onChange={e => onUpdateReceipt(p.id, rIdx, { stock_area: e.target.value })}
                        placeholder='Stock Area'
                        className=''
                      /> */}
                    </td>
                    <td className='px-2 py-2'>
                      {/* <Input
                        value={r.stock_section_id}
                        disabled={locked}
                        onChange={e => onUpdateReceipt(p.id, rIdx, { stock_section_id: e.target.value })}
                        placeholder='Section'
                        className=''
                      /> */}
                    </td>
                    <td className='px-2 py-2'>
                      <Input
                        value={r.dye_lot}
                        disabled={locked || viewOnly}
                        onChange={e => onUpdateReceipt(p.id, rIdx, { dye_lot: e.target.value })}
                        placeholder='Dye Lot'
                        className=''
                      />
                    </td>
                    <td className='px-2 py-2 text-center'>
                      {!locked && !viewOnly && (
                        <button
                          type='button'
                          title='Remove receipt'
                          onClick={() => onRemoveReceipt(p.id, rIdx)}
                          className='text-muted-foreground hover:text-destructive transition-colors'
                        >
                          <Trash2Icon className='w-4 h-4' />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Total Amount per product */}
        <div className='flex items-center justify-end gap-3 px-4 py-2 border-t border-border bg-border/5'>
          {isQuantityExceeded && (
            <span className='text-xs text-destructive font-medium'>
              Received ({totalReceived}) exceeds ordered ({p.ordered_quantity})
            </span>
          )}
          <span className='text-xs text-muted-foreground'>Total Amount</span>
          <span className='text-xs font-semibold'>
            <span className='text-destructive mr-0.5'>*</span>
            {productTotalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default ShipmentProductCard
