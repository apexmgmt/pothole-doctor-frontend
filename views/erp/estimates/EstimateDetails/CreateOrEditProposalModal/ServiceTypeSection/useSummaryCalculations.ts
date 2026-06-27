import { ProposalServiceItemPayload } from '@/types'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

/**
 * Custom hook to aggregate and calculate financial summaries for a list of proposal service lines.
 * It computes totals for costs, sales, taxes, freight, and profit margins by iterating through
 * the provided line items and applying relevant business rules based on line types (e.g., product, labor, deduction).
 *
 * @param lines - An array of proposal service item payloads to aggregate.
 * @param taxRate - The global tax rate percentage to apply to taxable lines.
 * @returns An object containing the calculated financial totals and profit percentages.
 */
export const useSummaryCalculations = (lines: ProposalServiceItemPayload[], taxRate: number) => {
  /** Total cost for all product line items. */
  const materialCost = lines.filter(l => l.type === 'product').reduce((sum, l) => sum + l.unit_cost * l.qty, 0)

  /** Total cost for all labor line items. */
  const laborCost = lines.filter(l => l.type === 'labor').reduce((sum, l) => sum + l.unit_cost * l.qty, 0)

  /**
   * Aggregate cost of all lines.
   * Subtracts deduction values, ignores comments, and adds standard unit costs.
   */
  const totalCosts = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)
    if (l.type === 'comment') return sum

    return sum + l.unit_cost * l.qty
  }, 0)

  /**
   * Total sales tax across all taxable line items (excluding deductions).
   * Computed using the global tax rate.
   */
  const salesTax = lines
    .filter(l => l.is_sale && l.type !== 'deduction')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty * (taxRate / 100), 0)

  /**
   * Total revenue (sales price) of the estimate.
   * Incorporates discounted prices and subtracts deductions.
   */
  const totalSales = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)

    return sum + getDiscountedUnitPrice(l) * l.qty
  }, 0)

  /** Total revenue generated specifically from product line items. */
  const materialSales = lines
    .filter(l => l.type === 'product')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  /** Total tax amount generated specifically from taxable product line items. */
  const materialTax = lines
    .filter(l => l.type === 'product' && l.is_sale)
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty * (taxRate / 100), 0)

  /** Total revenue generated specifically from labor line items. */
  const laborSales = lines
    .filter(l => l.type === 'labor')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  /** Total revenue generated specifically from expense line items. */
  const totalExpense = lines
    .filter(l => l.type === 'expense')
    .reduce((sum, l) => sum + getDiscountedUnitPrice(l) * l.qty, 0)

  /**
   * Sum of all freight charges across all line items.
   * Parses string values safely if necessary.
   */
  const totalFreight = lines.reduce(
    (sum, l) =>
      sum + (typeof l.freight_charge === 'number' ? l.freight_charge : parseFloat(l.freight_charge ?? '0') || 0),
    0
  )

  /**
   * Net profit amount of the estimate.
   * Calculates the margin by subtracting unit costs and freight charges from the discounted unit price.
   * Subtracts deductions.
   */
  const profitAmount = lines.reduce((sum, l) => {
    if (l.type === 'deduction') return sum - (l.total_price ?? 0)

    return sum + (getDiscountedUnitPrice(l) - l.unit_cost) * l.qty - (l.freight_charge ?? 0)
  }, 0)

  /** Net profit margin percentage relative to the total sales. */
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
