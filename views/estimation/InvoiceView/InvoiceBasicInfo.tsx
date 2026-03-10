import { Invoice } from '@/types'
import { formatDate } from '@/utils/date'

const InvoiceBasicInfo = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company Address */}
        <p>{invoice?.estimate?.assign_user?.userable?.address}</p>
        {/* Company Email */}
        <p>Email: {invoice?.estimate?.assign_user?.email}</p>
        {/* Company Phone */}
        <p>Phone: {invoice?.estimate?.assign_user?.userable?.phone}</p>
      </div>
      {/* Invoice Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>INVOICE</h6>
        <p>Invoice #{String(invoice?.invoice_number).padStart(6, '0')}</p>
        {invoice?.issue_date && <p>Issue Date: {formatDate(new Date(invoice.issue_date))}</p>}
        {invoice?.due_date && <p>Due Date: {formatDate(new Date(invoice.due_date))}</p>}
      </div>
    </div>
  )
}

export default InvoiceBasicInfo
