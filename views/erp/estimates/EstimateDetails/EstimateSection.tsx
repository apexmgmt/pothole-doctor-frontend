import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BusinessLocation, Client, Estimate, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import { formatDate, formatDateTime } from '@/utils/date'
import CreateOrEditEstimateModal from '../CreateOrEditEstimateModal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/utils/role-permission'

const EstimateSection = ({
  estimateId,
  estimate,
  serviceTypes,
  estimateTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations
}: {
  estimateId: string
  estimate: Estimate
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const [canEditEstimate, setCanEditEstimate] = useState<boolean>(false)

  // Check permissions
  useEffect(() => {
    hasPermission('Update Estimate').then(result => setCanEditEstimate(result))
  }, [])

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
          {canEditEstimate && (
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
          )}
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2 text-zinc-200 text-sm'>
            <div className='flex gap-1 items-start'>
              <span className='font-semibold text-base text-white min-w-40'>Estimate number : </span>
              <div className='flex-1'>{estimate.estimate_number?.toString().padStart(6, '0') || 'N/A'}</div>
            </div>
            <div className='flex gap-1 items-start'>
              <span className='font-semibold text-base text-white min-w-40'>Estimate title : </span>
              <div className='flex-1'>{estimate.title || ''}</div>
            </div>
            <div className='flex gap-1 items-start'>
              <span className='font-semibold text-base text-white min-w-40'>Estimate type : </span>
              <div className='flex-1'>{estimate.estimate_type?.name || 'N/A'}</div>
            </div>
            {estimate.estimate_type?.name === 'Material Only' && estimate?.interaction && (
              <>
                {estimate.interaction === 'cash_and_pickup' ? (
                  <>
                    <div className='flex gap-1 items-start'>
                      <span className='font-semibold text-base text-white min-w-40'>Interaction : </span>
                      <div className='flex-1'>Cash and Pickup</div>
                    </div>
                    {estimate?.pickup_date && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Pickup date : </span>
                        <div className='flex-1'>{formatDate(estimate.pickup_date)}</div>
                      </div>
                    )}
                    {estimate?.pickup_location && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Pickup location : </span>
                        <div className='flex-1'>{estimate.pickup_location?.name || 'N/A'}</div>
                      </div>
                    )}
                    {estimate?.pickup_notes && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Pickup notes : </span>
                        <div className='flex-1'>{estimate.pickup_notes || 'N/A'}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className='flex gap-1 items-start'>
                      <span className='font-semibold text-base text-white min-w-40'>Interaction : </span>
                      <div className='flex-1'>Cash and Delivery</div>
                    </div>
                    {estimate?.delivery_datetime && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Delivery datetime : </span>
                        <div className='flex-1'>{formatDateTime(estimate.delivery_datetime)}</div>
                      </div>
                    )}
                    {estimate?.delivery_location && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Delivery location : </span>
                        <div className='flex-1'>{estimate.delivery_location || 'N/A'}</div>
                      </div>
                    )}
                    {estimate?.delivery_notes && (
                      <div className='flex gap-1 items-start'>
                        <span className='font-semibold text-base text-white min-w-40'>Delivery notes : </span>
                        <div className='flex-1'>{estimate.delivery_notes || 'N/A'}</div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {estimate.location && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Location :</span>

                <div className='flex-1'>
                  {[
                    estimate.location?.name,
                    estimate.location?.street_address,
                    estimate.location?.city?.name,
                    [estimate.location?.state?.name, estimate.location?.zip_code].filter(Boolean).join(' ')
                  ]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </div>
              </div>
            )}
            {estimate.address && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Job Location :</span>

                <div>
                  {[
                    estimate.address?.street_address,
                    estimate.address?.city?.name,
                    [estimate.address?.state?.name, estimate.address?.zip_code].filter(Boolean).join(' ')
                  ]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </div>
              </div>
            )}
            {estimate.biding_date && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Select bid date : </span>
                <div className='flex-1'>{formatDate(estimate.biding_date)}</div>
              </div>
            )}
            {estimate.expiration_date && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Expiration date : </span>
                <div className='flex-1'>{formatDate(estimate.expiration_date)}</div>
              </div>
            )}
            {estimate.client && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Customer : </span>
                <div className='flex-1'>
                  {estimate.client?.first_name} {estimate.client?.last_name}
                </div>
              </div>
            )}
            {estimate.payment_term && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Payment terms : </span>
                <div className='flex-1'>{estimate.payment_term?.name ?? estimate.payment_term_id}</div>
              </div>
            )}
            {estimate.assign_user && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Assigned estimator : </span>{' '}
                <div className='flex-1'>
                  {estimate.assign_user?.first_name} {estimate.assign_user?.last_name}
                </div>
              </div>
            )}
            {estimate.tax_rate && (
              <div className='flex gap-1 items-start'>
                <span className='font-semibold text-base text-white min-w-40'>Tax Rate : </span>
                <div className='flex-1'>{estimate.tax_rate}</div>
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
        businessLocations={businessLocations}
      />
    </>
  )
}

export default EstimateSection
