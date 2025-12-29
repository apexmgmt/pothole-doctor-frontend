import { Card, CardContent } from '@/components/ui/card'
import { Estimate } from '@/types'
import { LocationEditIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react'

const ClientDetailsCard = ({ estimateDetails }: { estimateDetails?: Estimate }) => {
  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <h6 className='text-sm font-semibold text-zinc-200'>
            <span>
              <UserIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.client?.first_name + ' ' + estimateDetails?.client?.last_name}
          </h6>
          <p className='text-sm font-semibold text-zinc-400'>
            <span>
              <LocationEditIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.location}
          </p>
          <p className='text-sm text-zinc-400'>
            <span>
              <MailIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.client?.email}
          </p>
          <p className='text-sm text-zinc-400'>
            <span>
              <PhoneIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.client?.phone}
          </p>
        </CardContent>
      </Card>
    </>
  )
}

export default ClientDetailsCard
