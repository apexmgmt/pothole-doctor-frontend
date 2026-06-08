import { Card, CardContent } from '@/components/ui/card'
import { Estimate } from '@/types'
import { LocationEditIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react'

const ClientDetailsCard = ({ estimateDetails }: { estimateDetails?: Estimate }) => {
  return (
    <>
      <Card className='bg-accent/40 border-accent'>
        <CardContent className='p-4 space-y-1'>
          <h6 className='text-xs font-semibold text-accent-foreground'>
            <span>
              <UserIcon className='h-4 w-4 inline-block mr-2' />
            </span>
            {estimateDetails?.client?.first_name + ' ' + estimateDetails?.client?.last_name}
          </h6>
          {estimateDetails?.client?.address && (
            <p className='text-xs font-semibold text-accent-foreground/60 flex items-start'>
              <span>
                <LocationEditIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              {estimateDetails?.client?.address?.street_address},
              {estimateDetails?.client?.address?.city?.name ? estimateDetails?.client?.address?.city?.name : ''}
              {estimateDetails?.client?.address?.state?.name
                ? ', ' + estimateDetails?.client?.address?.state?.name
                : ''}
              {estimateDetails?.client?.address?.zip_code ? ' ' + estimateDetails?.client?.address?.zip_code : ''}
            </p>
          )}
          {estimateDetails?.client?.email && (
            <p className='text-xs text-accent-foreground/60'>
              <span>
                <MailIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              {estimateDetails?.client?.email}
            </p>
          )}
          {estimateDetails?.client?.phone && (
            <p className='text-xs text-accent-foreground/60'>
              <span>
                <PhoneIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              {estimateDetails?.client?.phone}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default ClientDetailsCard
