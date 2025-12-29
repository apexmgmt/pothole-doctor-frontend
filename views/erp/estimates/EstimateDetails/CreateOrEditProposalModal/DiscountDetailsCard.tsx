import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Estimate } from '@/types'
import { DollarSign, PercentIcon, UserIcon, X } from 'lucide-react'

const SalesRepresentativeCard = ({ estimateDetails }: { estimateDetails?: Estimate }) => {
  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <h6 className='flex justify-end text-sm font-semibold text-zinc-200 mb-4'>{'Discount'}</h6>
          <div className='flex justify-end'>
            {/* Calculated discount amount */}
            <p className='text-sm font-semibold text-red-400'>{'$0.00'}</p>
          </div>
          <Separator />
          <div className='flex justify-end'>
            <Button variant='outline'>
              <DollarSign className='h-4 w-4' />
            </Button>
            <Button variant='outline'>
              <PercentIcon className='h-4 w-4' />
            </Button>
            <Button variant='outline'>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default SalesRepresentativeCard
