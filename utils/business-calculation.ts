import { ProposalServiceItemPayload } from '@/types'

export const getDiscountedUnitPrice = (line: ProposalServiceItemPayload) => {
  const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
  const discount = line.discount ?? 0
  const discountType = line.discount_type ?? 'percentage'

  if (discountType === 'fixed') {
    // discount is a total amount applied across the whole line (not per unit)
    const baseTotal = baseUnitPrice * line.qty
    const discountedTotal = Math.max(0, baseTotal - discount)

    return line.qty > 0 ? discountedTotal / line.qty : 0
  } else {
    return baseUnitPrice * (1 - discount / 100)
  }
}

/**
 * Calculates the sell price from cost and margin.
 * Formula: sellPrice = cost / (1 - margin / 100)
 * @param cost - The cost/purchase price of the product
 * @param margin - The margin percentage (e.g. 40 for 40%)
 * @returns The sell price, or 0 if inputs are invalid or margin >= 100
 */
export const getSellPrice = (cost: number, margin: number): number => {
  const c = Number(cost)
  const m = Number(margin)

  if (isNaN(c) || isNaN(m) || m >= 100) return 0

  return Number((c / (1 - m / 100)).toFixed(4))
}

/**
 * Calculates the cost price from sell price and margin.
 * Formula: cost = sellPrice * (1 - margin / 100)
 * @param sellPrice - The sell/customer price of the product
 * @param margin - The margin percentage (e.g. 40 for 40%)
 * @returns The cost price, or 0 if inputs are invalid
 */
export const getCostPrice = (sellPrice: number, margin: number): number => {
  const sp = Number(sellPrice)
  const m = Number(margin)

  if (isNaN(sp) || isNaN(m)) return 0

  return Number((sp * (1 - m / 100)).toFixed(4))
}

/**
 * Calculates the margin percentage from cost and sell price.
 * Formula: margin = (1 - cost / sellPrice) * 100
 * @param costPrice - The cost/purchase price of the product
 * @param sellPrice - The sell/customer price of the product
 * @returns The margin percentage, or 0 if inputs are invalid or sellPrice is 0
 */
export const getMargin = (costPrice: number, sellPrice: number): number => {
  const c = Number(costPrice)
  const sp = Number(sellPrice)

  if (isNaN(c) || isNaN(sp) || sp === 0) return 0

  return Number(((1 - c / sp) * 100).toFixed(4))
}
