import { LaborCost, Product, ProposalServiceItemPayload } from '@/types'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

interface UseServiceTypeLinesParams {
  lines: ProposalServiceItemPayload[]
  onLinesChange: (lines: ProposalServiceItemPayload[]) => void
  taxRate: number
  hideMargin: boolean
}

export const useServiceTypeLines = ({ lines, onLinesChange, taxRate, hideMargin }: UseServiceTypeLinesParams) => {
  const recalculateLine = (line: ProposalServiceItemPayload): ProposalServiceItemPayload => {
    const unit_price = getDiscountedUnitPrice(line)
    const total_cost = line.unit_cost * line.qty
    const total_price = unit_price * line.qty
    const tax_amount = line.is_sale ? unit_price * line.qty * (taxRate / 100) : 0

    return { ...line, unit_price, total_cost, total_price, tax_amount, tax: tax_amount }
  }

  const clampProductQty = (qty: number, line: ProposalServiceItemPayload): number => {
    if (!line.product_id || !line.product) return qty

    const minQty = Number(line.product.minimum_qty ?? 0)
    const roundUp = !!line.product.round_up_quantity
    let adjusted = qty

    if (roundUp) adjusted = Math.ceil(adjusted)
    if (minQty > 0) adjusted = Math.ceil(adjusted / minQty) * minQty

    return adjusted
  }

  const updateLineFields = (idx: number, fields: Partial<ProposalServiceItemPayload>) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line

      const updatedLine = { ...line, ...fields }

      return line.type === 'deduction' ? updatedLine : recalculateLine(updatedLine)
    })

    onLinesChange(updated)
  }

  const updateLine = (idx: number, field: keyof ProposalServiceItemPayload, value: any) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line

      const updatedLine = { ...line, [field]: value }

      return line.type === 'deduction' ? updatedLine : recalculateLine(updatedLine)
    })

    onLinesChange(updated)
  }

  const removeLine = (idx: number) => {
    onLinesChange(lines.filter((_, i) => i !== idx))
  }

  const addLine = (type: ProposalServiceItemPayload['type']) => {
    let newLine: ProposalServiceItemPayload = {
      name: '',
      description: '',
      type,
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

    if (type === 'comment') newLine = { ...newLine, qty: 0, unit_cost: 0, margin: 0, unit_name: '' }
    if (type === 'deduction') newLine = { ...newLine, unit_cost: 0, qty: 1, margin: 0, unit_name: '' }

    onLinesChange([...lines, newLine])
  }

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
        margin: hideMargin ? 0 : lc.margin,
        unit_id: lc.unit_id ?? '',
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

  const onProductSelect = (products: Product[]) => {
    const newLines: ProposalServiceItemPayload[] = products.map(product =>
      recalculateLine({
        product_id: product.id,
        product: product,
        name: product.name,
        description: product.description,
        type: 'product',
        unit_cost: product?.product_cost.toFixed(2) as unknown as number,

        // unit_cost:
        //   (product?.selling_unit_id === product?.purchase_uom_id
        //     ? product.product_cost
        //     : product?.coverage_per_unit_id === product?.selling_unit_id
        //       ? product.product_cost / (product?.coverage_per_rate ?? 1)
        //       : product?.product_cost).toFixed(2) as unknown as number,
        qty: product.minimum_qty || product?.coverage_per_rate || 0,
        unit_id: product.selling_unit_id ?? '',
        unit_name: product.selling_unit?.name ?? product.selling_uom?.name ?? '',
        vendor_id: product.vendor_id ?? '',
        margin: hideMargin ? 0 : product.margin,
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

  return {
    recalculateLine,
    clampProductQty,
    addLine,
    updateLine,
    updateLineFields,
    removeLine,
    onLaborCostSelect,
    onProductSelect
  }
}
