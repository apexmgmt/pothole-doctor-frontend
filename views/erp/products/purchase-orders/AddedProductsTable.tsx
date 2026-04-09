'use client'

import { Trash2Icon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import type { AddedProduct } from './types'

interface AddedProductsTableProps {
  addedProducts: AddedProduct[]
  onRemove: (productId: string) => void
  onFieldChange: (productId: string, field: 'quantity' | 'company_cost' | 'work_order_cost', value: number) => void
}

const AddedProductsTable = ({ addedProducts, onRemove, onFieldChange }: AddedProductsTableProps) => {
  if (addedProducts.length === 0) return null

  return (
    <div className='border border-border rounded-lg overflow-hidden'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border bg-border/20'>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Mat. #</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>SKU</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Product Name</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Description</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Style</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Color</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground w-24'>Quantity</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>UOM</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Total Coverage</th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>
              <div>Company Cost</div>
              <div className='font-normal text-xs'>WO Cost</div>
            </th>
            <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Total</th>
            <th className='w-8'></th>
          </tr>
        </thead>
        <tbody>
          {addedProducts.map((ap, index) => {
            const totalCoverage =
              ap.product.coverage_per_rate != null
                ? Number((ap.quantity * ap.product.coverage_per_rate).toFixed(2))
                : null

            const rowTotal = Number((ap.company_cost * ap.quantity).toFixed(2))

            return (
              <tr key={ap.product_id} className='border-b border-border last:border-0'>
                <td className='px-3 py-2 text-muted-foreground'>{index + 1}</td>
                <td className='px-3 py-2'>{ap.product.sku}</td>
                <td className='px-3 py-2'>{ap.product.vendor_product_name || ap.product.private_product_name}</td>
                <td className='px-3 py-2 text-muted-foreground'>{ap.product.description || '—'}</td>
                <td className='px-3 py-2'>{ap.product.vendor_style || ap.product.private_style || '—'}</td>
                <td className='px-3 py-2'>{ap.product.vendor_color || ap.product.private_color || '—'}</td>
                <td className='px-3 py-2'>
                  <Input
                    type='number'
                    min={1}
                    step='any'
                    value={ap.quantity}
                    onChange={e => onFieldChange(ap.product_id, 'quantity', Number(e.target.value))}
                    className='h-7 text-xs w-20'
                  />
                </td>
                <td className='px-3 py-2'>{ap.product.purchase_unit?.name ?? ap.product.purchase_uom?.name ?? '—'}</td>
                <td className='px-3 py-2'>
                  {totalCoverage != null
                    ? `${totalCoverage} (${ap.product.coverage_unit?.name ?? ap.product.coverage_uom?.name ?? ''})`
                    : '—'}
                </td>
                <td className='px-3 py-2'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                      <Input
                        type='number'
                        min={0}
                        step='any'
                        value={ap.company_cost}
                        onChange={e => onFieldChange(ap.product_id, 'company_cost', Number(e.target.value))}
                        className='h-7 text-xs w-24'
                      />
                      <span className='text-xs text-muted-foreground whitespace-nowrap'>
                        {ap.product.purchase_unit?.name ?? ap.product.purchase_uom?.name ?? ''}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Input
                        type='number'
                        min={0}
                        step='any'
                        value={ap.work_order_cost}
                        onChange={e => onFieldChange(ap.product_id, 'work_order_cost', Number(e.target.value))}
                        className='h-7 text-xs w-24'
                      />
                      <span className='text-xs text-muted-foreground whitespace-nowrap'>
                        {ap.product.selling_unit?.name ?? ap.product.selling_uom?.name ?? ''}
                      </span>
                    </div>
                  </div>
                </td>
                <td className='px-3 py-2'>${rowTotal.toFixed(2)}</td>
                <td className='px-3 py-2'>
                  <button
                    type='button'
                    onClick={() => onRemove(ap.product_id)}
                    className='text-muted-foreground hover:text-destructive transition-colors'
                  >
                    <Trash2Icon className='w-4 h-4' />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AddedProductsTable
