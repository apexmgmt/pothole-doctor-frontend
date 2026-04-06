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
  Box,
  Trash2
} from 'lucide-react'
import { useState, useRef } from 'react'
import LaborCostsModal from '@/views/erp/labor-costs/LaborCostsModal'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import ProductsModal from '@/views/erp/products/ProductsModal'
import { cn } from '@/lib/utils'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'
import ServiceTypeSummary from './ServiceTypeSummary'
import ServiceTypeActions from './ServiceTypeActions'
import LineItemActions from './LineItemActions'

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
  vendors = [],
  taxRate = 0,
  hideMargin = false,
  allowedLineTypes
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
  taxRate: number
  hideMargin?: boolean
  allowedLineTypes?: ProposalServiceItemPayload['type'][]
}) => {
  const [openLaborCostModal, setOpenLaborCostModal] = useState(false)
  const [openProductsModal, setOpenProductsModal] = useState(false)
  const [totalSqft, setTotalSqft] = useState('0')
  const [margin, setMargin] = useState('0')
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({})
  const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})

  const getEditValue = (idx: number, field: string, fallback: string) =>
    editingValues[`${idx}-${field}`] !== undefined ? editingValues[`${idx}-${field}`] : fallback

  const setEditValue = (idx: number, field: string, value: string) =>
    setEditingValues(prev => ({ ...prev, [`${idx}-${field}`]: value }))

  const clearEditValue = (idx: number, field: string) =>
    setEditingValues(prev => {
      const next = { ...prev }

      delete next[`${idx}-${field}`]

      return next
    })

  const recalculateLine = (line: ProposalServiceItemPayload): ProposalServiceItemPayload => {
    const unit_price = getDiscountedUnitPrice(line)
    const total_cost = line.unit_cost * line.qty
    const total_price = unit_price * line.qty
    const tax_amount = line.is_sale ? unit_price * line.qty * (taxRate / 100) : 0 // Apply tax rate

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

      return sum + unitPrice * line.qty * (taxRate / 100)
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

  // Calculate material tax for product lines
  const materialTax = lines
    .filter(line => line.type === 'product' && line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty * (taxRate / 100)
    }, 0)

  const laborSales = lines
    .filter(line => line.type === 'labor')
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      return sum + unitPrice * line.qty
    }, 0)

  const totalExpense = lines
    .filter(line => line.type === 'expense')
    .reduce((sum, line) => sum + getDiscountedUnitPrice(line) * line.qty, 0)

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
        note: '',
        item_id: null
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
        unit_name: product.selling_unit?.name ?? product.selling_uom?.name ?? '',
        margin: product.margin,
        unit_price: 0,
        discount: 0,
        discount_type: 'percentage',
        freight_charge: 0,
        is_sale: 1,
        tax_type: 'percentage',
        tax: 0,
        tax_amount: 0,
        note: '',
        item_id: null
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
      note: '',
      item_id: null
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
          <ServiceTypeActions
            mode={mode}
            margin={margin}
            setMargin={setMargin}
            lines={lines}
            recalculateLine={recalculateLine}
            onLinesChange={onLinesChange}
            setOpenProductsModal={setOpenProductsModal}
            setOpenLaborCostModal={setOpenLaborCostModal}
            addLine={addLine}
            hideMargin={hideMargin}
            allowedLineTypes={allowedLineTypes}
          />
          {/* Summary Section */}
          <ServiceTypeSummary
            materialCost={materialCost}
            materialSales={materialSales}
            materialTax={materialTax}
            laborCost={laborCost}
            totalCosts={totalCosts}
            totalExpense={totalExpense}
            totalFreight={totalFreight}
            salesTax={salesTax}
            totalSales={totalSales}
            laborSales={laborSales}
            profitAmount={profitAmount}
            profitPercent={profitPercent}
          />

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
                  {!hideMargin && <th className='px-2 py-1'>Margin</th>}
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
                              value={getEditValue(idx, 'description', line.description ?? '')}
                              onChange={e => setEditValue(idx, 'description', e.target.value)}
                              onBlur={e => {
                                updateLine(idx, 'description', e.target.value)
                                clearEditValue(idx, 'description')
                              }}
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
                              <Trash2 className='h-4 w-4 text-red-400' />
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
                            value={getEditValue(idx, 'name', line.name ?? '')}
                            onChange={e => setEditValue(idx, 'name', e.target.value)}
                            onBlur={e => {
                              updateLine(idx, 'name', e.target.value)
                              clearEditValue(idx, 'name')
                            }}
                            className={cn('w-full', line.type === 'deduction' && 'text-red-500')}
                            placeholder='Item Name'
                            disabled={mode === 'view'}
                          />
                        </div>
                      </td>
                      <td className='px-2 py-1'>
                        <Input
                          value={getEditValue(idx, 'description', line.description ?? '')}
                          onChange={e => setEditValue(idx, 'description', e.target.value)}
                          onBlur={e => {
                            updateLine(idx, 'description', e.target.value)
                            clearEditValue(idx, 'description')
                          }}
                          className='w-full text-red-500'
                          placeholder='Empty'
                          disabled={mode === 'view'}
                        />
                      </td>
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
                            disabled={mode === 'view'}
                          />
                        )}
                      </td>
                      <td className='px-2 py-1'>
                        {line.type !== 'deduction' && (
                          <Input
                            type='number'
                            value={getEditValue(idx, 'qty', String(line.qty ?? 1))}
                            onChange={e => setEditValue(idx, 'qty', e.target.value)}
                            onBlur={e => {
                              updateLine(idx, 'qty', parseFloat(e.target.value) || 0)
                              clearEditValue(idx, 'qty')
                            }}
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
                      {!hideMargin && (
                        <td className='px-2 py-1 flex items-center gap-1'>
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
                                disabled={mode === 'view'}
                              />
                              <span>%</span>
                            </>
                          )}
                        </td>
                      )}
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
                      <td className='px-2 py-1 text-center'>
                        {line.type !== 'deduction' && (
                          <Checkbox
                            disabled={mode === 'view'}
                            checked={line.is_sale === 1 ? true : false}
                            onCheckedChange={checked => updateLine(idx, 'is_sale', !!checked ? 1 : 0)}
                          />
                        )}
                      </td>
                      <LineItemActions
                        line={line}
                        idx={idx}
                        mode={mode}
                        updateLine={updateLine}
                        removeLine={removeLine}
                      />
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
