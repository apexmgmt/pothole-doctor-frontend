import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TotalCalculationCard = ({
  subtotal = 0,
  salesTax = 0,
  total = 0,
  title
}: {
  subtotal?: number | string
  salesTax?: number | string
  total?: number | string
  title?: string
}) => (
  <Card className='bg-zinc-900 border-zinc-800'>
    <CardContent className='p-4'>
      {title && <p className='text-xs font-bold text-zinc-400 uppercase mb-3'>{title}</p>}
      <h6 className='text-sm font-semibold text-zinc-200 mb-4'>Subtotal: ${Number(subtotal).toFixed(2)}</h6>
      <h6 className='text-sm font-semibold text-zinc-200 mb-4'>Sales Tax: ${Number(salesTax).toFixed(2)}</h6>
      <Separator />
      <div className='flex gap-1'>
        <p className='text-sm font-semibold text-zinc-200'>{'Total:'}</p>
        <p className='text-sm font-semibold text-zinc-400'>${Number(total).toFixed(2)}</p>
      </div>
    </CardContent>
  </Card>
)

export default TotalCalculationCard
