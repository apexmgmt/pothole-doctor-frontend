import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LaborCost, Product, ProductCategory, ProposalServiceItemPayload, ServiceType, Unit, Vendor } from '@/types'
import {
  Settings2Icon,
  GridIcon,
  MessageSquareIcon,
  ClipboardIcon,
  XIcon,
  Wrench,
  Boxes,
  Minus
} from 'lucide-react'
import { useState } from 'react'
import LaborCostsModal from '@/views/erp/labor-costs/LaborCostsModal'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import ProductsModal from '@/views/erp/products/ProductsModal'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface ServiceTypeSectionProps {
  serviceTypeId: string
  serviceTypeName: string
  onRemove: () => void
  serviceTypes: ServiceType[]
  units: Unit[]
  lines: ProposalServiceItemPayload[]
  onLinesChange: (lines: ProposalServiceItemPayload[]) => void
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}

const defaultLine: ProposalServiceItemPayload = {
  name: '',
  description: '',
  type: 'invoice',
  unit_cost: 0,
  qty: 0,
  unit_name: '',
  margin: 0,
  unit_price: 0,
  discount: 0,
  freight_cost: 0,
  is_sale: 0,
  tax_amount: 0,
  note: '',
  total_cost: 0,
  total_price: 0
}

const ServiceTypeSection = ({
  serviceTypeName,
  serviceTypeId,
  onRemove,
  serviceTypes = [],
  units = [],
  lines,
  onLinesChange,
  productCategories = [],
  uomUnits = [],
  vendors = []
}: ServiceTypeSectionProps) => {
  const [openLaborCostModal, setOpenLaborCostModal] = useState(false)
  const [openProductsModal, setOpenProductsModal] = useState(false)
  const [totalSqft, setTotalSqft] = useState('0')
  const [margin, setMargin] = useState('0')

  const getDiscountedUnitPrice = (line: ProposalServiceItemPayload) => {
    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discount = line.discount ?? 0

    return baseUnitPrice * (1 - discount / 100)
  }

  const recalculateLine = (line: ProposalServiceItemPayload): ProposalServiceItemPayload => {
    const unit_price = getDiscountedUnitPrice(line)
    const total_cost = line.unit_cost * line.qty
    const total_price = unit_price * line.qty
    const tax_amount = line.is_sale ? unit_price * line.qty * 0.1 : 0 // Example: 10% tax

    return {
      ...line,
      unit_price,
      total_cost,
      total_price,
      tax_amount
    }
  }

  // Calculate summary values from lines
  // Calculate material cost for product lines
  const materialCost = lines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => sum + (line.unit_cost + (line.freight_cost ?? 0)) * line.qty, 0)

  const laborCost = lines
    .filter(line => line.type === 'labor-cost')
    .reduce((sum, line) => sum + (line.unit_cost + (line.freight_cost ?? 0)) * line.qty, 0)

  const totalCosts = lines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.unit_cost + (line.freight_cost ?? 0)) * line.qty
    }

    if (line.type === 'comment') {
      return sum
    }

    return sum + (line.unit_cost + (line.freight_cost ?? 0)) * line.qty
  }, 0)

  // Example: sales tax is applied only to lines with salesTax checked
  const salesTax = lines
    .filter(line => line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

      return sum + unitPrice * line.qty * 0.1 // 10% tax as example
    }, 0)

  const totalSales = lines.reduce((sum, line) => {
    const unitPrice = getDiscountedUnitPrice(line)

    if (line.type === 'deduction') {
      return sum - unitPrice * line.qty
    }

    return sum + unitPrice * line.qty
  }, 0)

  // Calculate material sales for product lines
  const materialSales = lines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => {
      const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

      return sum + unitPrice * line.qty
    }, 0)

  // Calculate material tax for product lines (example: 0% tax)
  const materialTax = lines
    .filter(line => line.type === 'product' && line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

      return sum + unitPrice * line.qty * 0.0 // 0% tax as example
    }, 0)

  const laborSales = lines
    .filter(line => line.type === 'labor-cost')
    .reduce((sum, line) => {
      const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

      return sum + unitPrice * line.qty
    }, 0)

  const totalExpense = lines
    .filter(line => line.type === 'expense')
    .reduce((sum, line) => sum + (line.unit_cost + (line.freight_cost ?? 0)) * line.qty, 0)

  const totalFreight = lines.reduce((sum, line) => sum + (line.freight_cost ?? 0) * line.qty, 0)

  // Handle labor cost selection from modal
  const onLaborCostSelect = (laborCosts: LaborCost[]) => {
    const newLines: ProposalServiceItemPayload[] = laborCosts.map(lc =>
      recalculateLine({
        name: lc.name,
        description: lc.description,
        type: 'labor-cost',
        unit_cost: lc.cost,
        qty: 1,
        margin: lc.margin,
        unit_name: lc?.unit?.name || '',
        unit_price: 0,
        discount: 0,
        freight_cost: 0,
        is_sale: 0,
        tax_amount: 0,
        note: ''
      })
    )

    onLinesChange([...lines, ...newLines])
  }

  // Handle product selection from modal
  const onProductSelect = (products: Product[]) => {
    const newLines: ProposalServiceItemPayload[] = products.map(product =>
      recalculateLine({
        name: product.name,
        description: product.description,
        type: 'product',
        unit_cost: product.product_cost,
        qty: 1,
        unit_name: product.coverage_per_uom?.unit?.name || '',
        margin: product.margin,
        unit_price: 0,
        discount: 0,
        freight_cost: 0,
        is_sale: 1,
        tax_amount: 0,
        note: ''
      })
    )

    onLinesChange([...lines, ...newLines])
  }

  // Add new line
  const addLine = (type: ProposalServiceItemPayload['type']) => {
    let newLine: ProposalServiceItemPayload = {
      name: '',
      description: '',
      type: type,
      unit_cost: 0,
      qty: 1,
      unit_name: '',
      margin: 0,
      unit_price: 0,
      discount: 0,
      freight_cost: 0,
      is_sale: 0,
      tax_amount: 0,
      note: ''
    }

    // For comment, qty/unit_cost/margin/unit are not needed
    if (type === 'comment') {
      newLine = {
        ...newLine,
        qty: 0,
        unit_cost: 0,
        margin: 0,
        unit_name: ''
      }
    }

    // For deduction, you may want to default unit_cost to 0 and qty to 1
    if (type === 'deduction') {
      newLine = {
        ...newLine,
        unit_cost: 0,
        qty: 1,
        margin: 0,
        unit_name: ''
      }
    }

    onLinesChange([...lines, newLine])
  }

  // Update a line
  const updateLine = (idx: number, field: keyof ProposalServiceItemPayload, value: any) => {
    const updated = lines.map((line, i) => (i === idx ? recalculateLine({ ...line, [field]: value }) : line))

    onLinesChange(updated)
  }

  // Remove a line
  const removeLine = (idx: number) => {
    onLinesChange(lines.filter((_, i) => i !== idx))
  }

  // Calculate total profit and profit percentage
  const profitAmount = lines.reduce((sum, line) => {
    const unitPrice = getDiscountedUnitPrice(line)

    if (line.type === 'deduction') {
      return sum - (unitPrice - line.unit_cost) * line.qty
    }

    return sum + (unitPrice - line.unit_cost) * line.qty
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings2Icon className='h-5 w-5 text-blue-500' />
              <h3 className='text-lg font-semibold text-white'>{serviceTypeName}</h3>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onRemove}
              className='h-8 w-8 p-0 text-zinc-400 hover:text-red-500'
            >
              <XIcon className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Input Section */}
          <div className='flex items-center gap-2 bg-zinc-800 p-3 rounded-md'>
            <div className='flex items-center gap-2 flex-1'>
              <span className='text-sm font-medium text-zinc-300'>Total SQFT:</span>
              <Input
                type='number'
                value={totalSqft}
                onChange={e => setTotalSqft(e.target.value)}
                className='w-24 h-8 bg-zinc-900 border-zinc-700'
              />
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <span className='text-zinc-400'>↻</span>
              </Button>
            </div>

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
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <span className='text-zinc-400'>↻</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-1'>
              <Button
                onClick={() => {
                  setOpenProductsModal(true)
                }}
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 text-zinc-400'
              >
                <Boxes className='h-4 w-4' />
              </Button>
              <Button
                onClick={() => {
                  setOpenLaborCostModal(true)
                }}
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
                    <DropdownMenuItem onClick={() => addLine('labor-cost')}>
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
          </div>

          {/* Summary Section */}
          <div className='grid grid-cols-3 gap-4 text-sm bg-zinc-800 p-3 rounded-md'>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Material Cost:</span>
                <span className='text-white font-medium'>${materialCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Material Sales:</span>
                <span className='text-white font-medium'>${materialSales.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Material Tax:</span>
                <span className='text-white font-medium'>${materialTax.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Labor Cost:</span>
                <span className='text-white font-medium'>${laborCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between pt-1 border-t border-zinc-700'>
                <span className='text-zinc-300 font-medium'>Total Costs:</span>
                <span className='text-white font-semibold'>${totalCosts.toFixed(2)}</span>
              </div>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Expenses:</span>
                <span className='text-white font-medium'>${totalExpense.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Freight:</span>
                <span className='text-white font-medium'>${totalFreight.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Sales Tax:</span>
                <span className='text-white font-medium'>${salesTax.toFixed(2)}</span>
              </div>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Total Sales:</span>
                <span className='text-white font-medium'>${totalSales.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Material Sales:</span>
                <span className='text-white font-medium'>${materialSales.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Labor Sales:</span>
                <span className='text-white font-medium'>${laborSales.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Profit:</span>
                <span className='text-white font-medium flex items-center gap-2'>
                  ${profitAmount.toFixed(2)}
                  <Badge variant='outline'>{profitPercent.toFixed(2)}%</Badge>
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className='overflow-x-auto rounded border border-zinc-800 mt-4'>
            <table className='min-w-full text-sm'>
              <thead className='bg-zinc-900 text-zinc-100'>
                <tr className='text-left'>
                  <th className='px-2 py-1'>#</th>
                  <th className='px-2 py-1'>Item Name</th>
                  <th className='px-2 py-1'>Description</th>
                  <th className='px-2 py-1'>Unit Cost</th>
                  <th className='px-2 py-1'>Quantity</th>
                  <th className='px-2 py-1'>Total Cost</th>
                  <th className='px-2 py-1'>Margin</th>
                  <th className='px-2 py-1'>Unit Price</th>
                  <th className='px-2 py-1'>Total Price</th>
                  <th className='px-2 py-1'>Sales Tax</th>
                  <th className='px-2 py-1'>Discount (%)</th>
                  <th className='px-2 py-1'>Freight</th>
                  <th className='px-2 py-1'></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const totalCost = line.unit_cost * line.qty
                  const unitPrice = getDiscountedUnitPrice(line)
                  const totalPrice = unitPrice * line.qty

                  if (line.type === 'comment') {
                    // Only show description for comment lines
                    return (
                      <tr key={idx} className={cn('border-b border-zinc-800 bg-muted')}>
                        <td className='px-2 py-1'>{idx + 1}.</td>
                        <td colSpan={11} className='px-2 py-1'>
                          <Input
                            value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            className='w-full bg-muted'
                            placeholder='Comment'
                          />
                        </td>
                        <td className='px-2 py-1'>
                          <Button size='icon' variant='ghost' onClick={() => removeLine(idx)}>
                            🗑️
                          </Button>
                        </td>
                        <td className='hidden'>
                          <input type='hidden' value={line.type || ''} readOnly />
                        </td>
                      </tr>
                    )
                  }

                  // Normal rendering for other line types
                  return (
                    <tr
                      key={idx}
                      className={cn('border-b border-zinc-800', line.type === 'deduction' && 'text-red-500')}
                    >
                      <td className='px-2 py-1'>{idx + 1}.</td>
                      <td className='px-2 py-1'>
                        <Input
                          value={line.name}
                          onChange={e => updateLine(idx, 'name', e.target.value)}
                          className={cn('w-full', line.type === 'deduction' && 'text-red-500')}
                          placeholder='Item Name'
                        />
                      </td>
                      <td className='px-2 py-1'>
                        <Input
                          value={line.description}
                          onChange={e => updateLine(idx, 'description', e.target.value)}
                          className='w-full text-red-500'
                          placeholder='Empty'
                        />
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={line.unit_cost}
                            onChange={e => updateLine(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className='w-28'
                            min={0}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={line.qty}
                            onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                            className='w-28 bg-yellow-200 text-black'
                            min={0}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && <Input value={totalCost.toFixed(2)} readOnly className='w-28' />}
                      </td>
                      <td className='px-2 py-1 flex items-center gap-1'>
                        {line.type !== 'deduction' && (
                          <>
                            <Input
                              type='number'
                              value={line.margin}
                              onChange={e => updateLine(idx, 'margin', parseFloat(e.target.value) || 0)}
                              className='w-28'
                              min={0}
                              max={100}
                            />
                            <span>%</span>
                          </>
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && <Input value={unitPrice.toFixed(2)} readOnly className='w-28' />}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type === 'deduction' ? (
                          <Input
                            value={line.total_price?.toFixed(2) ?? ''}
                            onChange={e => updateLine(idx, 'total_price', e.target.value)}
                            className='w-28'
                          />
                        ) : (
                          <Input value={line.total_price?.toFixed(2) ?? ''} readOnly className='w-28' />
                        )}
                      </td>
                      <td className='px-2 py-1 text-center'>
                        {line.type !== 'deduction' && (
                          <Checkbox
                            checked={line.is_sale === 1 ? true : false}
                            onCheckedChange={checked => updateLine(idx, 'is_sale', !!checked ? 1 : 0)}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={line.discount ?? 0}
                            onChange={e => updateLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                            className='w-20'
                            min={0}
                            max={100}
                            step={1}
                            placeholder='0'
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type === 'product' ? (
                          <Input
                            type='number'
                            value={line.freight_cost ?? 0}
                            onChange={e => updateLine(idx, 'freight_cost', parseFloat(e.target.value) || 0)}
                            className='w-20'
                            min={0}
                            step={0.01}
                            placeholder='0.00'
                          />
                        ) : (
                          <span className='text-zinc-400'>—</span>
                        )}
                      </td>
                      <td className='px-2 py-1 flex gap-1'>
                        {/* Note Button with Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size='icon' variant='ghost'>
                              📝
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-64 p-2'>
                            <Textarea
                              value={line.note || ''}
                              onChange={e => updateLine(idx, 'note', e.target.value)}
                              placeholder='Add note...'
                              className='min-h-20'
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Delete Button */}
                        <Button size='icon' variant='ghost' onClick={() => removeLine(idx)}>
                          🗑️
                        </Button>
                      </td>
                      <td className='hidden'>
                        <input type='hidden' value={line.type || ''} readOnly />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <LaborCostsModal
        open={openLaborCostModal}
        onOpenChange={setOpenLaborCostModal}
        serviceTypes={serviceTypes}
        units={units}
        onSelect={(laborCosts: LaborCost[]) => onLaborCostSelect(laborCosts)}
      />
      <ProductsModal
        open={openProductsModal}
        onOpenChange={setOpenProductsModal}
        serviceTypes={serviceTypes}
        productCategories={productCategories}
        uomUnits={uomUnits}
        vendors={vendors}
        onSelect={(products: Product[]) => onProductSelect(products)}
      />
    </>
  )
}

export default ServiceTypeSection
