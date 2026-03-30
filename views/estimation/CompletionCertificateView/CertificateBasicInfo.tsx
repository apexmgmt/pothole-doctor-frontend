import { WorkOrder } from '@/types'
import { formatDate } from '@/utils/date'

const CertificateBasicInfo = ({ workOrder }: { workOrder: WorkOrder }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company Address */}
        <p>{workOrder?.assign_user?.userable?.address}</p>
        {/* Company Email */}
        <p>Email: {workOrder?.assign_user?.email}</p>
        {/* Company Phone */}
        {workOrder?.assign_user?.userable?.phone && <p>Phone: {workOrder?.assign_user?.userable?.phone}</p>}
      </div>
      {/* Invoice Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>COMPLETION CERTIFICATE</h6>
        <p>Invoice #{String(workOrder?.invoice?.invoice_number).padStart(6, '0')}</p>
        {workOrder?.invoice?.issue_date && <p>Issue Date: {formatDate(new Date(workOrder.invoice.issue_date))}</p>}
        {workOrder?.invoice?.due_date && <p>Due Date: {formatDate(new Date(workOrder.invoice.due_date))}</p>}
      </div>
    </div>
  )
}

export default CertificateBasicInfo
