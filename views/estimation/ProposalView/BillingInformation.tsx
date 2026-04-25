import { Proposal } from '@/types'

const BillingInformation = ({ proposal }: { proposal: Proposal }) => {
  return (
    <div className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between mt-4 text-sm print:text-black'>
      {/* Bill To */}
      <div className='flex flex-col'>
        <h6 className='font-semibold text-base mb-4'>Customer Information</h6>
        {proposal?.estimate?.client?.company?.name && <p>{proposal?.estimate?.client?.company?.name}</p>}
        <p>{proposal?.estimate?.client?.first_name + ' ' + proposal?.estimate?.client?.last_name}</p>
        <p className=' wrap-break-word'>
          {proposal?.estimate?.client?.address?.street_address},
          {proposal?.estimate?.client?.address?.city?.name ? proposal?.estimate?.client?.address?.city?.name : ''}
          {proposal?.estimate?.client?.address?.state?.name
            ? ', ' + proposal?.estimate?.client?.address?.state?.name
            : ''}
          {proposal?.estimate?.client?.address?.zip_code ? ' ' + proposal?.estimate?.client?.address?.zip_code : ''}
        </p>
        <p>{proposal?.estimate?.client?.email}</p>
        <p>{proposal?.estimate?.client?.phone}</p>
      </div>
      {/* Service Site */}
      <div className='flex flex-col sm:text-right'>
        <h6 className='font-semibold text-base mb-4'>Service Site</h6>
        <p className=' wrap-break-word'>
          {proposal?.estimate?.address?.street_address},
          {proposal?.estimate?.address?.city?.name ? proposal?.estimate?.address?.city?.name : ''}
          {proposal?.estimate?.address?.state?.name
            ? ', ' + proposal?.estimate?.address?.state?.name
            : ''}
          {proposal?.estimate?.address?.zip_code ? ' ' + proposal?.estimate?.address?.zip_code : ''}
        </p>
        <p>{proposal?.estimate?.client?.email}</p>
        <p>{proposal?.estimate?.client?.phone}</p>
      </div>
    </div>
  )
}

export default BillingInformation
