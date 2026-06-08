import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/utils/currency'

interface ServiceTypeSummaryProps {
  materialCost: number
  materialSales: number
  materialTax: number
  laborCost: number
  totalCosts: number
  totalExpense: number
  totalFreight: number
  salesTax: number
  totalSales: number
  laborSales: number
  profitAmount: number
  profitPercent: number
  simpleSummary?: boolean
}

const ServiceTypeSummary = ({
  materialCost,
  materialSales,
  materialTax,
  laborCost,
  totalCosts,
  totalExpense,
  totalFreight,
  salesTax,
  totalSales,
  laborSales,
  profitAmount,
  profitPercent,
  simpleSummary = false
}: ServiceTypeSummaryProps) => {
  if (simpleSummary) {
    return (
      <div className='grid grid-cols-2 gap-4 text-sm bg-accent/40 p-3 rounded-xl border border-accent'>
        <div className='space-y-1'>
          <div className='flex justify-between'>
            <span className='text-accent-foreground/70'>Material Cost:</span>
            <span className='text-white font-medium'>{formatCurrency(materialCost)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-accent-foreground/70'>Labor Cost:</span>
            <span className='text-white font-medium'>{formatCurrency(laborCost)}</span>
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex justify-between'>
            <span className='text-accent-foreground/70'>Freight:</span>
            <span className='text-white font-medium'>{formatCurrency(totalFreight)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-accent-foreground/70'>Sales Tax:</span>
            <span className='text-white font-medium'>{formatCurrency(salesTax)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-hidden'>
      <ScrollArea className='w-full'>
        <div className='grid grid-cols-3 gap-6 md:gap-8 text-sm bg-accent/40 p-3 rounded-xl border border-accent min-w-2xl'>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Material Cost:</span>
              <span className='text-white font-medium'>{formatCurrency(materialCost)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Material Sales:</span>
              <span className='text-white font-medium'>{formatCurrency(materialSales)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Material Tax:</span>
              <span className='text-white font-medium'>{formatCurrency(materialTax)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Labor Cost:</span>
              <span className='text-white font-medium'>{formatCurrency(laborCost)}</span>
            </div>
            <div className='flex justify-between pt-1 border-t border-zinc-700'>
              <span className='text-zinc-300 font-medium'>Total Costs:</span>
              <span className='text-white font-semibold'>{formatCurrency(totalCosts)}</span>
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Expenses:</span>
              <span className='text-white font-medium'>{formatCurrency(totalExpense)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Freight:</span>
              <span className='text-white font-medium'>{formatCurrency(totalFreight)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Sales Tax:</span>
              <span className='text-white font-medium'>{formatCurrency(salesTax)}</span>
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Total Sales:</span>
              <span className='text-white font-medium'>{formatCurrency(totalSales)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Material Sales:</span>
              <span className='text-white font-medium'>{formatCurrency(materialSales)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Labor Sales:</span>
              <span className='text-white font-medium'>{formatCurrency(laborSales)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-accent-foreground/70'>Profit:</span>
              <span className='text-white font-medium flex items-center gap-2'>
                {formatCurrency(profitAmount)}
                <Badge variant='outline'>{profitPercent.toFixed(2)}%</Badge>
              </span>
            </div>
          </div>
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </div>
  )
}

export default ServiceTypeSummary
