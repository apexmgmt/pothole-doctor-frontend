import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const ProfitDetailsCard = ({
  profitPercent = 0,
  profitAmount = 0,
  totalProfit = 0
}: {
  profitPercent?: number
  profitAmount?: number
  totalProfit?: number
}) => (
  <Card className='bg-zinc-900 border-zinc-800'>
    <CardContent className='p-4'>
      <h6 className='text-sm font-semibold text-zinc-200 mb-4 flex justify-end'>{'Profit'}</h6>
      <div className='flex justify-between'>
        <Badge>{profitPercent.toFixed(2)}%</Badge>
        <p className='text-sm font-semibold text-red-400'>${profitAmount.toFixed(2)}</p>
      </div>
      <Separator />
      <div className='flex justify-between'>
        <p className='text-sm font-semibold text-zinc-200'>{'Total Profit'}</p>
        <p className='text-sm font-semibold text-zinc-400'>${totalProfit.toFixed(2)}</p>
      </div>
    </CardContent>
  </Card>
)

export default ProfitDetailsCard
