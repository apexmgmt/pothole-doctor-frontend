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
