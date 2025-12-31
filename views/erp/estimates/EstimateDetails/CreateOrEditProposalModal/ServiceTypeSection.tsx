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
  Minus,
  Box
} from 'lucide-react'
import { useState, useRef } from 'react'
import LaborCostsModal from '@/views/erp/labor-costs/LaborCostsModal'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import ProductsModal from '@/views/erp/products/ProductsModal'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const ServiceTypeSection = ({
  mode,
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
}: {
  mode: 'create' | 'edit' | 'view'
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
}) => {
  const [openLaborCostModal, setOpenLaborCostModal] = useState(false)
  const [openProductsModal, setOpenProductsModal] = useState(false)
  const [totalSqft, setTotalSqft] = useState('0')
  const [margin, setMargin] = useState('0')
  const [editingValues, setEditingValues] = useState<{ [key: number]: string }>({})
  const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})

  const getDiscountedUnitPrice = (line: ProposalServiceItemPayload) => {
    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discount = line.discount ?? 0
    const discountType = line.discount_type ?? 'percentage'

    if (discountType === 'fixed') {
      return Math.max(0, baseUnitPrice - discount)
    } else {
      return baseUnitPrice * (1 - discount / 100)
    }
  }

  const recalculateLine = (line: ProposalServiceItemPayload): ProposalServiceItemPayload => {
    const unit_price = getDiscountedUnitPrice(line)
    const total_cost = line.unit_cost * line.qty
    const total_price = unit_price * line.qty
    const tax_amount = line.is_sale ? unit_price * line.qty * 0 : 0 // Example: 0% tax

    return {
      ...line,
      unit_price,
      total_cost,
      total_price,
      tax_amount,
      tax: tax_amount
    }
  }

  // Calculate summary values from lines
  // Calculate material cost for product lines
  const materialCost = lines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => sum + line.unit_cost * line.qty, 0)

  const laborCost = lines
    .filter(line => line.type === 'labor')
    .reduce((sum, line) => sum + line.unit_cost * line.qty, 0)

  const totalCosts = lines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Use total_price directly for deductions
    }

    if (line.type === 'comment') {
      return sum
    }

    return sum + line.unit_cost * line.qty
  }, 0)

  // Example: sales tax is applied only to lines with is_sale checked
  const salesTax = lines
    .filter(line => line.is_sale)
    .reduce((sum, line) => {
      if (line.type === 'deduction') {
        return sum
      }

      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty * 0 // 0% tax as example
    }, 0)

  const totalSales = lines.reduce((sum, line) => {
    const unitPrice = getDiscountedUnitPrice(line)

    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Use total_price directly for deductions
    }

    return sum + unitPrice * line.qty
  }, 0)

  // Calculate material sales for product lines
  const materialSales = lines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty
    }, 0)

  // Calculate material tax for product lines (example: 0% tax)
  const materialTax = lines
    .filter(line => line.type === 'product' && line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty * 0.0 // 0% tax as example
    }, 0)

  const laborSales = lines
    .filter(line => line.type === 'labor')
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty
    }, 0)

  const totalExpense = lines
    .filter(line => line.type === 'expense')
    .reduce((sum, line) => sum + (getDiscountedUnitPrice(line) * line.qty), 0)

  const totalFreight = lines.reduce(
    (sum, line) =>
      sum +
      (typeof line.freight_charge === 'number' ? line.freight_charge : parseFloat(line.freight_charge ?? '0') || 0),
    0
  )

  // Handle labor cost selection from modal
  const onLaborCostSelect = (laborCosts: LaborCost[]) => {
    const newLines: ProposalServiceItemPayload[] = laborCosts.map(lc =>
      recalculateLine({
        labor_cost_id: lc.id,
        labor_cost: lc,
        name: lc.name,
        description: lc.description,
        type: 'labor',
        unit_cost: lc.cost,
        qty: 1,
        margin: lc.margin,
        unit_name: lc?.unit?.name || '',
        unit_price: 0,
        discount: 0,
        discount_type: 'percentage',
        freight_charge: 0,
        is_sale: 0,
        tax_amount: 0,
        tax_type: 'percentage',
        note: ''
      })
    )

    onLinesChange([...lines, ...newLines])
  }

  // Handle product selection from modal
  const onProductSelect = (products: Product[]) => {
    const newLines: ProposalServiceItemPayload[] = products.map(product =>
      recalculateLine({
        product_id: product.id,
        product: product,
        name: product.name,
        description: product.description,
        type: 'product',
        unit_cost: product.product_cost,
        qty: 1,
        unit_name: product.selling_info?.unit?.name || '',
        margin: product.margin,
        unit_price: 0,
        discount: 0,
        discount_type: 'percentage',
        freight_charge: 0,
        is_sale: 1,
        tax_type: 'percentage',
        tax: 0,
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
      discount_type: 'percentage',
      freight_charge: 0,
      is_sale: 0,
      tax_type: 'percentage',
      tax: 0,
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
    const updated = lines.map((line, i) => {
      if (i === idx) {
        const updatedLine = { ...line, [field]: value }

        // For deduction lines, allow direct editing of total_price without recalculation
        if (line.type === 'deduction') {
          return updatedLine
        }

        // For all other cases, recalculate
        return recalculateLine(updatedLine)
      }

      return line
    })

    onLinesChange(updated)
  }

  // Remove a line
  const removeLine = (idx: number) => {
    onLinesChange(lines.filter((_, i) => i !== idx))
  }

  // Calculate total profit and profit percentage
  const profitAmount = lines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Deduction reduces profit
    }

    const unitPrice = getDiscountedUnitPrice(line)

    return sum + (unitPrice - line.unit_cost) * line.qty - (line.freight_charge ?? 0)
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
            {/* <div className='flex items-center gap-2 flex-1'>
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
            </div> */}

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
                <span className='text-white font-medium'>${Number(totalFreight).toFixed(2)}</span>
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
                  <th className='px-2 py-1'></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line: ProposalServiceItemPayload, idx) => {
                  const totalCost = line.unit_cost * line.qty
                  const unitPrice = getDiscountedUnitPrice(line)
                  const totalPrice = unitPrice * line.qty

                  if (line.type === 'comment') {
                    // Only show description for comment lines
                    return (
                      <tr key={idx} className={cn('border-b border-zinc-800 bg-muted')}>
                        <td className='px-2 py-1'>{idx + 1}.</td>
                        <td colSpan={7} className='px-2 py-1 pr-8'>
                          <div className='flex items-center gap-2'>
                            <MessageSquareIcon className='h-4 w-4 text-zinc-400' />

                            <Input
                              value={line.description}
                              onChange={e => updateLine(idx, 'description', e.target.value)}
                              className='w-full bg-muted'
                              placeholder='Comment'
                              disabled={mode === 'view'}
                            />
                          </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td className='px-2 py-1 flex justify-end gap-1'>
                          {mode !== 'view' && (
                            <Button size='icon' variant='ghost' onClick={() => removeLine(idx)}>
                              🗑️
                            </Button>
                          )}
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
                        <div className='flex items-center gap-2'>
                          {line.type === 'product' && line.product_id && <Boxes className='h-4 w-4 text-zinc-400' />}
                          {line.type === 'product' && !line.product_id && <Box className='h-4 w-4 text-zinc-400' />}
                          {line.type === 'labor' && <Wrench className='h-4 w-4 text-zinc-400' />}
                          {line.type === 'expense' && <ClipboardIcon className='h-4 w-4 text-zinc-400' />}
                          {line.type === 'invoice' && <GridIcon className='h-4 w-4 text-zinc-400' />}
                          {line.type === 'deduction' && <Minus className='h-4 w-4 text-red-500' />}
                          <Input
                            value={line.name ?? ''}
                            onChange={e => updateLine(idx, 'name', e.target.value)}
                            className={cn('w-full', line.type === 'deduction' && 'text-red-500')}
                            placeholder='Item Name'
                            disabled={mode === 'view'}
                          />
                        </div>
                      </td>
                      <td className='px-2 py-1'>
                        <Input
                          value={line.description ?? ''}
                          onChange={e => updateLine(idx, 'description', e.target.value)}
                          className='w-full text-red-500'
                          placeholder='Empty'
                          disabled={mode === 'view'}
                        />
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={line.unit_cost ?? 1}
                            onChange={e => updateLine(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className='w-28'
                            min={0}
                            disabled={mode === 'view'}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={line.qty ?? 1}
                            onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                            className='w-28 bg-yellow-200 text-black'
                            min={0}
                            disabled={mode === 'view'}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input value={totalCost.toFixed(2) ?? ''} readOnly className='w-28' />
                        )}
                      </td>
                      <td className='px-2 py-1 flex items-center gap-1'>
                        {line.type !== 'deduction' && (
                          <>
                            <Input
                              type='number'
                              value={line.margin ?? 0}
                              onChange={e => updateLine(idx, 'margin', parseFloat(e.target.value) || 0)}
                              className='w-28'
                              min={0}
                              max={100}
                              disabled={mode === 'view'}
                            />
                            <span>%</span>
                          </>
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input value={unitPrice.toFixed(2) ?? ''} readOnly className='w-28' />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type === 'deduction' ? (
                          <Input
                            disabled={mode === 'view'}
                            type='number'
                            min={0}
                            value={
                              editingValues[idx] !== undefined
                                ? editingValues[idx]
                                : (Number(line.total_price)?.toFixed(2) ?? '')
                            }
                            onChange={e => setEditingValues({ ...editingValues, [idx]: e.target.value })}
                            onBlur={e => {
                              // Update the array when user leaves the field
                              updateLine(idx, 'total_price', parseFloat(e.target.value) || 0)

                              // Clear the local state
                              setEditingValues(prev => {
                                const newState = { ...prev }

                                delete newState[idx]

                                return newState
                              })
                            }}
                            className='w-28'
                          />
                        ) : (
                          <Input value={Number(line.total_price)?.toFixed(2) ?? ''} readOnly className='w-28' />
                        )}
                      </td>
                      <td className='px-2 py-1 text-center'>
                        {line.type !== 'deduction' && (
                          <Checkbox
                            disabled={mode === 'view'}
                            checked={line.is_sale === 1 ? true : false}
                            onCheckedChange={checked => updateLine(idx, 'is_sale', !!checked ? 1 : 0)}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1 flex gap-1 justify-end'>
                        {/* Freight charge dropdown */}
                        {line.type === 'product' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size='icon' variant='ghost' title='Freight Charge'>
                                🚚
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
                                  disabled={mode === 'view'}
                                />
                                <div className='text-xs text-zinc-400'>Enter freight charge</div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {/* Discount button dropdown */}
                        {line.type !== 'expense' && line.type !== 'deduction' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size='icon' variant='ghost' title='Discount'>
                                💰
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-64 p-3'>
                              <div className='space-y-2'>
                                <div className='flex gap-2'>
                                  <Button
                                    variant={line.discount_type === 'percentage' ? 'default' : 'outline'}
                                    size='sm'
                                    onClick={() => updateLine(idx, 'discount_type', 'percentage')}
                                    className='flex-1'
                                  >
                                    %
                                  </Button>
                                  <Button
                                    variant={line.discount_type === 'fixed' ? 'default' : 'outline'}
                                    size='sm'
                                    onClick={() => updateLine(idx, 'discount_type', 'fixed')}
                                    className='flex-1'
                                  >
                                    $
                                  </Button>
                                </div>
                                <Input
                                  disabled={mode === 'view'}
                                  type='number'
                                  value={line.discount ?? 0}
                                  onChange={e => {
                                    const value = parseFloat(e.target.value) || 0
                                    const discountType = line.discount_type ?? 'percentage'

                                    // Validation
                                    if (discountType === 'percentage' && (value < 0 || value > 100)) {
                                      return
                                    }

                                    if (discountType === 'fixed' && value > line.unit_cost) {
                                      return
                                    }

                                    updateLine(idx, 'discount', value)
                                  }}
                                  placeholder={line.discount_type === 'fixed' ? 'Amount' : '0-100'}
                                  min={0}
                                  max={line.discount_type === 'percentage' ? 100 : undefined}
                                  step={line.discount_type === 'percentage' ? 1 : 0.01}
                                />
                                <div className='text-xs text-zinc-400'>
                                  {line.discount_type === 'fixed'
                                    ? `Discount can't greater than the unit cost`
                                    : 'Enter 0-100%'}
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Note Button with Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size='icon' variant='ghost' title='Note'>
                              📝
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-64 p-2'>
                            <Textarea
                              disabled={mode === 'view'}
                              value={line.note || ''}
                              onChange={e => updateLine(idx, 'note', e.target.value)}
                              placeholder='Add note...'
                              className='min-h-20'
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete Button */}
                        {mode !== 'view' && (
                          <Button size='icon' variant='ghost' onClick={() => removeLine(idx)} title='Delete'>
                            🗑️
                          </Button>
                        )}
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
