import { WorkOrder } from '@/types'
import { formatDate } from '@/utils/date'
import { generateFileUrl } from '@/utils/utility'
import Image from 'next/image'
import Link from 'next/link'

const CertificateBasicInfo = ({ workOrder }: { workOrder: WorkOrder }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 text-black'>
      {/* Company Info */}
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company or Location Logo */}
        <Link href={'/erp'} className=''>
          <Image
            src={
              workOrder?.location?.is_branding
                ? (generateFileUrl(workOrder?.location?.logo) ?? '/images/dashboard/logo.webp')
                : '/images/dashboard/logo.webp'
            }
            alt='logo'
            width={145}
            height={61}
            unoptimized
            className='py-4'
          />
        </Link>
        {/* Location Name */}
        {workOrder?.location?.name && <p className='font-semibold'>{workOrder?.location?.name}</p>}
        {/* Location Address */}
        {workOrder?.location?.street_address && (
          <p>
            {workOrder?.location?.street_address}
            <br />
            {workOrder?.location?.city?.name}
            {workOrder?.location?.state && ','} {workOrder?.location?.state?.name}
            {workOrder?.location?.zip_code && ','} {workOrder?.location?.zip_code}
          </p>
        )}
        {/* Location Website */}
        {workOrder?.location?.website && <p>{workOrder?.location?.website}</p>}
        {/* Assign User Email */}
        {workOrder?.assign_user?.email && <p>Email: {workOrder?.assign_user?.email}</p>}
        {/* Assign User Phone */}
        {workOrder?.assign_user?.userable?.phone && (
          <p>Phone: {workOrder?.assign_user?.userable?.phone}</p>
        )}
      </div>
      {/* Invoice Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>COMPLETION CERTIFICATE</h6>
        <p>
          Invoice #{workOrder?.invoice?.invoice_number_prefix ? `${workOrder.invoice.invoice_number_prefix}-` : ''}
          {String(workOrder?.invoice?.invoice_number)}
        </p>
        {workOrder?.invoice?.issue_date && <p>Issue Date: {formatDate(new Date(workOrder.invoice.issue_date))}</p>}
        {workOrder?.invoice?.due_date && <p>Due Date: {formatDate(new Date(workOrder.invoice.due_date))}</p>}
      </div>
    </div>
  )
}

export default CertificateBasicInfo
