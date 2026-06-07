import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/currency'

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
  <Card className='bg-accent/40 border-accent'>
    <CardContent className='p-4 flex flex-col h-full'>
      <div className='flex-1'>
        {title && <p className='text-xs font-bold uppercase mb-3'>{title}</p>}
        <h6 className='text-xs font-semibold mb-4'>Subtotal: {formatCurrency(subtotal)}</h6>
        <h6 className='text-xs font-semibold mb-4'>Sales Tax: {formatCurrency(salesTax)}</h6>
      </div>
      <Separator className='mb-3' />
      <div className='flex gap-1'>
        <p className='text-xs font-semibold'>{'Total:'}</p>
        <p className='text-xs font-semibold'>${Number(total).toFixed(2)}</p>
      </div>
    </CardContent>
  </Card>
)

export default TotalCalculationCard
