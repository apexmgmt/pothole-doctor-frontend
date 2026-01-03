import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Client, Estimate, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import { formatDate } from '@/utils/date'
import CreateOrEditEstimateModal from '../CreateOrEditEstimateModal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // This function will be called after a successful edit
  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open)

    if (!open) {
      // Modal just closed, so refetch the data
      router.refresh()
    }
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-white text-base'>Details</CardTitle>
          <Button
            onClick={() => {
              setIsModalOpen(true)
            }}
            size='sm'
            variant='outline'
            className='text-xs px-3 py-1 bg-white text-black'
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2 text-zinc-200 text-sm'>
            <div>
              <span className='font-semibold text-base text-white'>Estimate title</span>
              <div>{estimate.title || ''}</div>
            </div>
            <div>
              <span className='font-semibold text-base text-white'>Estimate type</span>
              <div>{estimate.estimate_type?.name || 'N/A'}</div>
            </div>
            <div>
              <span className='font-semibold text-base text-white'>Estimate number</span>
              <div>{estimate.estimate_number?.toString().padStart(6, '0') || 'N/A'}</div>
            </div>
            {estimate.service_type && (
              <div>
                <span className='font-semibold text-base text-white'>Service type</span>
                <div>{estimate.service_type?.name ?? 'N/A'}</div>
              </div>
            )}
            <div>
              <span className='font-semibold text-base text-white'>Estimate location</span>
              <div>{estimate.location || 'N/A'}</div>
            </div>
            {estimate.biding_date && (
              <div>
                <span className='font-semibold text-base text-white'>Select bid date</span>
                <div>{formatDate(estimate.biding_date)}</div>
              </div>
            )}
            {estimate.expiration_date && (
              <div>
                <span className='font-semibold text-base text-white'>Expiration date</span>
                <div>{formatDate(estimate.expiration_date)}</div>
              </div>
            )}
            {estimate.client && (
              <div>
                <span className='font-semibold text-base text-white'>Customer</span>
                <div>
                  {estimate.client?.first_name} {estimate.client?.last_name}
                </div>
              </div>
            )}
            {estimate.payment_term && (
              <div>
                <span className='font-semibold text-base text-white'>Payment terms</span>
                <div>{estimate.payment_term?.name ?? estimate.payment_term_id}</div>
              </div>
            )}
            {estimate.assign_user && (
              <div>
                <span className='font-semibold text-base text-white'>Assigned estimator</span>
                <div>
                  {estimate.assign_user?.first_name} {estimate.assign_user?.last_name}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateOrEditEstimateModal
        mode={'edit'}
        open={isModalOpen}
        onOpenChange={handleModalChange}
        estimateId={estimateId || undefined}
        estimateDetails={estimate || undefined}
        serviceTypes={serviceTypes}
        estimateTypes={estimateTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
      />
    </>
  )
}

export default EstimateSection
