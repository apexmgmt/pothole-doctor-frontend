import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Estimate } from '@/types'
import { UserIcon } from 'lucide-react'

const SalesRepresentativeCard = ({ estimateDetails }: { estimateDetails?: Estimate }) => {
  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <h6 className='text-sm font-semibold text-zinc-200 mb-4'>
            <span>
              <UserIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.assign_user?.first_name + ' ' + estimateDetails?.assign_user?.last_name}
          </h6>
          <div className='flex justify-between'>
            {/* Commission percentage based on commission setting */}
            <Badge>{'0.00%'}</Badge>
            {/* Calculated commission amount */}
            <p className='text-sm font-semibold text-red-400'>{'$0.00'}</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default SalesRepresentativeCard
