import { Badge } from '@/components/ui/badge'

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
  profitPercent
}: ServiceTypeSummaryProps) => (
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
)

export default ServiceTypeSummary
