import { Proposal } from "@/types"
import { formatDate } from "@/utils/date"

const ProposalBasicInfo = ({proposal}: {proposal: Proposal}) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 print:text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company Address */}
        <p>{proposal?.estimate?.assign_user?.userable?.address}</p>
        {/* Company Email */}
        <p>Email: {proposal?.estimate?.assign_user?.email}</p>
        {/* Company Phone */}
        <p>Phone: {proposal?.estimate?.assign_user?.userable?.phone}</p>
      </div>
      {/* Proposal Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>PROPOSAL</h6>
        <p>Proposal #{String(proposal?.proposal_number).padStart(6, '0')}</p>
        <p>Date: {formatDate(new Date(proposal?.created_at))}</p>
      </div>
    </div>
  )
}

export default ProposalBasicInfo
