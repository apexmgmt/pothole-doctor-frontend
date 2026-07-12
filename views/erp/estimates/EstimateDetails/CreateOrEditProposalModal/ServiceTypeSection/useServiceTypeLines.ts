import { LaborCost, Product, ProposalServiceItemPayload } from '@/types'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'
import { mathRoundFixed } from '@/utils/utility'

interface UseServiceTypeLinesParams {
  lines: ProposalServiceItemPayload[]
  onLinesChange: (lines: ProposalServiceItemPayload[]) => void
  taxRate: number
  hideMargin: boolean
}

/**
 * Custom hook to manage the state and calculations of proposal service lines.
 * It provides utilities for adding, removing, updating, and recalculating line items
 * (e.g., products, labor, comments, deductions) within a proposal estimate.
 *
 * @param params - Configuration parameters containing the current lines, change handler, tax rate, and margin visibility.
 * @returns An object containing utility functions to manage the service lines.
 */
export const useServiceTypeLines = ({ lines, onLinesChange, taxRate, hideMargin }: UseServiceTypeLinesParams) => {
  /**
   * Recalculates the financial fields of a single line item based on its current quantity and unit cost.
   * This updates the unit price (applying discounts), total cost, total price, tax amount, and freight charge.
   *
   * @param line - The proposal service item payload to recalculate.
   * @returns A new proposal service item payload with updated calculated fields.
   */
  const recalculateLine = (line: ProposalServiceItemPayload): ProposalServiceItemPayload => {
    const unit_price = getDiscountedUnitPrice(line)
    const total_cost = line.unit_cost * line.qty
    const total_price = unit_price * line.qty
    const tax_amount = line.is_sale ? unit_price * line.qty * (taxRate / 100) : 0

    let freight_charge = line.freight_charge ?? 0

    if (line.type === 'product' && line.product?.is_freight_percentage) {
      const freightPct = Number(line.product.freight_amount ?? 0)

      freight_charge = mathRoundFixed(total_price * (freightPct / 100), 2)
    }

    return { ...line, unit_price, total_cost, total_price, tax_amount, tax: tax_amount, freight_charge }
  }

  /**
   * Clamps the quantity of a product line item to ensure it meets the product's minimum quantity
   * and coverage requirements.
   *
   * Rules applied:
   * 1. The final quantity cannot be less than the product's minimum quantity (if specified).
   * 2. The final quantity must be a multiple of the product's coverage rate (always rounded up to the nearest multiple).
   * 3. If the product requires rounding up to an integer and the coverage has no fractional value, the final quantity is rounded up.
   *
   * @param qty - The initial requested quantity.
   * @param line - The proposal service item payload containing product rules.
   * @returns The adjusted quantity adhering to the product's rules.
   */
  const clampProductQty = (qty: number, line: ProposalServiceItemPayload): number => {
    if (!line.product_id || !line.product) return qty

    const coverage = Number(line.product.coverage_per_rate || 0)
    const minQty = Number(line.product.minimum_qty || 0)
    const roundUp = !!line.product.round_up_quantity
    let adjusted = qty

    if (minQty > 0 && adjusted < minQty) {
      adjusted = minQty
    }

    if (coverage > 0) {
      adjusted = Math.ceil(adjusted / coverage) * coverage

      if (minQty > 0 && adjusted < minQty) {
        adjusted = Math.ceil(minQty / coverage) * coverage
      }
    }

    if (roundUp && Number.isInteger(coverage)) {
      adjusted = Math.ceil(adjusted)
    }

    return adjusted
  }

  /**
   * Updates multiple fields on a specific line item identified by its index.
   * Automatically recalculates the financial fields for the line unless it is a 'deduction'.
   *
   * @param idx - The index of the line item to update.
   * @param fields - A partial object containing the fields to update.
   */
  const updateLineFields = (idx: number, fields: Partial<ProposalServiceItemPayload>) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line

      const updatedLine = { ...line, ...fields }

      return line.type === 'deduction' ? updatedLine : recalculateLine(updatedLine)
    })

    onLinesChange(updated)
  }

  /**
   * Updates a single specific field on a line item identified by its index.
   * Automatically recalculates the financial fields for the line unless it is a 'deduction'.
   *
   * @param idx - The index of the line item to update.
   * @param field - The key of the field to update.
   * @param value - The new value for the field.
   */
  const updateLine = (idx: number, field: keyof ProposalServiceItemPayload, value: any) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line

      const updatedLine = { ...line, [field]: value }

      return line.type === 'deduction' ? updatedLine : recalculateLine(updatedLine)
    })

    onLinesChange(updated)
  }

  /**
   * Removes a specific line item from the list based on its index.
   *
   * @param idx - The index of the line item to remove.
   */
  const removeLine = (idx: number) => {
    onLinesChange(lines.filter((_, i) => i !== idx))
  }

  /**
   * Adds a new, empty line item of the specified type to the end of the list.
   * Sets appropriate default values depending on the type (e.g., product, labor, comment, deduction).
   *
   * @param type - The type of line item to add.
   */
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
      is_sale: type === 'product' || type === 'labor' || type === 'invoice' ? 1 : 0,
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

  /**
   * Appends newly selected labor cost items to the list of service lines.
   * Initializes the line items with the labor cost details and triggers a recalculation for each.
   *
   * @param laborCosts - An array of labor cost items to add.
   */
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
        is_sale: 1,
        tax_amount: 0,
        tax_type: 'percentage',
        note: '',
        item_id: null
      })
    )

    onLinesChange([...lines, ...newLines])
  }

  /**
   * Appends newly selected products to the list of service lines.
   * Initializes the line items with the product details, default quantities based on coverage/minimums,
   * freight rules, and triggers a recalculation for each.
   *
   * @param products - An array of products to add.
   */
  const onProductSelect = (products: Product[]) => {
    const newLines: ProposalServiceItemPayload[] = products.map(product =>
      recalculateLine({
        product_id: product.id,
        product: product,
        name: product.name,
        description: product.description,
        type: 'product',
        unit_cost: Number(product?.product_cost ?? 0).toFixed(2) as unknown as number,

        // unit_cost:
        //   (product?.selling_unit_id === product?.purchase_uom_id
        //     ? product.product_cost
        //     : product?.coverage_per_unit_id === product?.selling_unit_id
        //       ? product.product_cost / (product?.coverage_per_rate ?? 1)
        //       : product?.product_cost).toFixed(2) as unknown as number,
        qty: product?.coverage_per_rate || product.minimum_qty || 0,
        unit_id: product.selling_unit_id ?? '',
        unit_name: product.selling_unit?.name ?? product.selling_uom?.name ?? '',
        vendor_id: product.vendor_id ?? '',
        margin: hideMargin ? 0 : product.margin,
        sku: product.sku ?? '',
        style: product.vendor_style ?? product?.private_style ?? '',
        color: product.vendor_color ?? product?.private_color ?? '',
        unit_price: 0,
        discount: 0,
        discount_type: 'percentage',
        freight_charge: !product.is_freight_percentage ? Number(product.freight_amount ?? 0) : 0,
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
