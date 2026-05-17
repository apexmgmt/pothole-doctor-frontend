import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/currency'

const ProfitDetailsCard = ({
  profitPercent = 0,
  profitAmount = 0,
  totalProfit = 0,
  totalNetProfit,
  totalCost
}: {
  profitPercent?: number
  profitAmount?: number
  totalProfit?: number
  totalNetProfit?: number
  totalCost?: number
}) => (
  <Card className='bg-zinc-900 border-zinc-800'>
    <CardContent className='p-4 flex flex-col h-full'>
      <div className='flex-1'>
        <h6 className='text-sm font-semibold text-zinc-200 mb-4 flex justify-end'>{'Profit'}</h6>
        <div className='flex justify-between mb-3'>
          <Badge>{profitPercent.toFixed(2)}%</Badge>
          <p className='text-sm font-semibold text-red-400'>{formatCurrency(profitAmount)}</p>
        </div>
      </div>
      <Separator className='mb-3' />
      {totalCost === undefined ? (
        <div className='flex justify-between'>
          <p className='text-sm font-semibold text-zinc-200'>{totalNetProfit !== undefined ? 'Total Net Profit' : 'Total Profit'}</p>
          <p className='text-sm font-semibold text-zinc-400'>
            {formatCurrency(totalNetProfit !== undefined ? totalNetProfit : totalProfit)}
          </p>
        </div>
      ) : (
        <div className='flex justify-between'>
          <p className='text-sm font-semibold text-zinc-200'>{'Total Cost'}</p>
          <p className='text-sm font-semibold text-zinc-400'>{formatCurrency(totalCost)}</p>
        </div>
      )}
    </CardContent>
  </Card>
)

export default ProfitDetailsCard
