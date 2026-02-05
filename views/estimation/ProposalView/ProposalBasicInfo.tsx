import { formatDate } from "@/utils/date"

const ProposalBasicInfo = () => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 print:text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company Address */}
        <p>708-D Fairground Rd, Lucasville, OH 45648</p>
        {/* Company Email */}
        <p>Email: todd@potholedoctors.com</p>
        {/* Company Phone */}
        <p>Phone: (740) 330-5155</p>
      </div>
      {/* Proposal Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>PROPOSAL</h6>
        <p>Proposal #12345</p>
        <p>Date: {formatDate(new Date())}</p>
      </div>
    </div>
  )
}

export default ProposalBasicInfo
