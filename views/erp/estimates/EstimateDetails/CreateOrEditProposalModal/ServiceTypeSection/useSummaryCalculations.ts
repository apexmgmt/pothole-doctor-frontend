import { ProposalServiceItemPayload } from '@/types'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

export const useSummaryCalculations = (lines: ProposalServiceItemPayload[], taxRate: number) => {
  const materialCost = lines.filter(l => l.type === 'product').reduce((sum, l) => sum + l.unit_cost * l.qty, 0)

  const laborCost = lines.filter(l => l.type === 'labor').reduce((sum, l) => sum + l.unit_cost * l.qty, 0)

  const totalCosts = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)
    if (l.type === 'comment') return sum

    return sum + l.unit_cost * l.qty
  }, 0)

  const salesTax = lines
    .filter(l => l.is_sale && l.type !== 'deduction')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty * (taxRate / 100), 0)

  const totalSales = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)

    return sum + getDiscountedUnitPrice(l) * l.qty
  }, 0)

  const materialSales = lines
    .filter(l => l.type === 'product')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  const materialTax = lines
    .filter(l => l.type === 'product' && l.is_sale)
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty * (taxRate / 100), 0)

  const laborSales = lines
    .filter(l => l.type === 'labor')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  const totalExpense = lines
    .filter(l => l.type === 'expense')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  const totalFreight = lines.reduce(
    (sum, l) =>
      sum + (typeof l.freight_charge === 'number' ? l.freight_charge : parseFloat(l.freight_charge ?? '0') || 0),
    0
  )

  const profitAmount = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)

    return sum + (getDiscountedUnitPrice(l) - l.unit_cost) * l.qty - (l.freight_charge ?? 0)
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

  return {
    materialCost,
    laborCost,
    totalCosts,
    salesTax,
    totalSales,
    materialSales,
    materialTax,
    laborSales,
    totalExpense,
    totalFreight,
    profitAmount,
    profitPercent
  }
}
