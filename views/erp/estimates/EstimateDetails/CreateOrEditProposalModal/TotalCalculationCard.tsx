import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TotalCalculationCard = ({
  subtotal = 0,
  salesTax = 0,
  total = 0
}: {
  subtotal?: number
  salesTax?: number
  total?: number
}) => (
  <Card className='bg-zinc-900 border-zinc-800'>
    <CardContent className='p-4'>
      <h6 className='text-sm font-semibold text-zinc-200 mb-4'>Subtotal: ${subtotal.toFixed(2)}</h6>
      <h6 className='text-sm font-semibold text-zinc-200 mb-4'>Sales Tax: ${salesTax.toFixed(2)}</h6>
      <Separator />
      <div className='flex gap-1'>
        <p className='text-sm font-semibold text-zinc-200'>{'Total:'}</p>
        <p className='text-sm font-semibold text-zinc-400'>${total.toFixed(2)}</p>
      </div>
    </CardContent>
  </Card>
)

export default TotalCalculationCard
