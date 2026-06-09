import { Invoice } from '@/types'
import { formatDate } from '@/utils/date'
import { generateFileUrl } from '@/utils/utility'
import Image from 'next/image'
import Link from 'next/link'

const InvoiceBasicInfo = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company Info */}
        <div className='flex flex-col text-sm'>
          {/* Company or Location Logo */}
          <Link href={'/erp'} className=''>
            <Image
              src={
                invoice?.location?.is_branding
                  ? (generateFileUrl(invoice?.location?.logo) ?? '/images/dashboard/logo.webp')
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
          {invoice?.location?.name && <p className='font-semibold'>{invoice?.location?.name}</p>}
          {/* Location Address */}
          {invoice?.location?.street_address && (
            <p>
              {invoice?.location?.street_address}
              <br />
              {invoice?.location?.city?.name}
              {invoice?.location?.state && ','} {invoice?.location?.state?.name}
              {invoice?.location?.zip_code && ','} {invoice?.location?.zip_code}
            </p>
          )}
          {/* Location Website */}
          {invoice?.location?.website && <p>{invoice?.location?.website}</p>}
          {/* Assign User Email */}
          {invoice?.assign_user?.email && <p>Email: {invoice?.assign_user?.email}</p>}
          {/* Assign User Phone */}
          {invoice?.assign_user?.userable?.phone && <p>Phone: {invoice?.assign_user?.userable?.phone}</p>}
        </div>
      </div>
      {/* Invoice Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>INVOICE</h6>
        <p>
          Invoice #{invoice?.invoice_number_prefix ? `${invoice.invoice_number_prefix}-` : ''}
          {String(invoice?.invoice_number)}
        </p>
        {invoice?.issue_date && <p>Issue Date: {formatDate(new Date(invoice.issue_date))}</p>}
        {invoice?.due_date && <p>Due Date: {formatDate(new Date(invoice.due_date))}</p>}
      </div>
    </div>
  )
}

export default InvoiceBasicInfo
