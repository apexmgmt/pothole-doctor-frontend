import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Client, Estimate, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import { formatDate } from '@/utils/date'

const EstimateSection = ({
  estimateId,
  estimate,
  serviceTypes,
  estimateTypes,
  clients,
  staffs,
  paymentTerms
}: {
  estimateId: string
  estimate: Estimate
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
}) => {
  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-white text-base'>Details</CardTitle>
        <Button size='sm' variant='outline' className='text-xs px-3 py-1 bg-white text-black'>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2 text-zinc-200 text-sm'>
          <div>
            <span className='font-semibold text-base text-white'>Estimate title</span>
            <div>{estimate.title}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Estimate type</span>
            <div>{estimate.estimate_type?.name || 'N/A'}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Estimate number</span>
            <div>{estimate.estimate_number?.toString().padStart(6, '0')}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Service type</span>
            <div>{estimate.service_type?.name ?? estimate.service_type_id}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Estimate location</span>
            <div>{estimate.location}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Select bid date</span>
            <div>{formatDate(estimate.biding_date)}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Expiration date</span>
            <div>{formatDate(estimate.expiration_date)}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Customer</span>
            <div>
              {estimate.client?.first_name} {estimate.client?.last_name}
            </div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Payment terms</span>
            <div>{estimate.payment_term?.name ?? estimate.payment_term_id}</div>
          </div>
          <div>
            <span className='font-semibold text-base text-white'>Assigned estimator</span>
            <div>
              {estimate.assign_user?.first_name} {estimate.assign_user?.last_name}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EstimateSection
