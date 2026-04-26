import { CompletionCertificate, WorkOrder } from '@/types'

const CertificateCustomerInfo = ({
  workOrder,
  completionCertificate
}: {
  workOrder: WorkOrder
  completionCertificate: CompletionCertificate | null
}) => {
  return (
    <div className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between mt-4 text-sm text-black'>
      {/* Customer Info */}
      <div className='flex flex-col'>
        <h6 className='font-semibold text-base mb-4'>Customer Information</h6>
        {workOrder?.client?.company?.name && <p>{workOrder.client.company.name}</p>}
        <p>{workOrder?.client?.first_name + ' ' + workOrder?.client?.last_name}</p>
        <p className='wrap-break-word'>
          {workOrder?.client?.address?.street_address}
          {workOrder?.client?.address?.city?.name ? ', ' + workOrder.client.address.city.name : ''}
          {workOrder?.client?.address?.state?.name ? ', ' + workOrder.client.address.state.name : ''}
          {workOrder?.client?.address?.zip_code ? ' ' + workOrder.client.address.zip_code : ''}
        </p>
        <p>{workOrder?.client?.email}</p>
        <p>{workOrder?.client?.phone}</p>
      </div>
      {/* Job Site Info */}
      <div className='flex flex-col sm:text-right'>
        <h6 className='font-semibold text-base mb-4'>{completionCertificate?.service_type_name ?? ''}</h6>
        <p className=''>
          <span className='font-semibold'>Job Title: </span>
          {workOrder?.title}
        </p>
        <p className=''>
          <span className='font-semibold'>Job Location: </span>
          {workOrder?.address ??
            (workOrder?.address?.street_address ?? '') +
              ', ' +
              (workOrder?.address?.city?.name ?? '') +
              ', ' +
              (workOrder?.address?.state?.name ?? '') +
              ' ' +
              (workOrder?.address?.zip_code ?? '')}
        </p>
      </div>
    </div>
  )
}

export default CertificateCustomerInfo
