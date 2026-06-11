import { Proposal } from '@/types'
import { formatDate } from '@/utils/date'
import { generateFileUrl } from '@/utils/utility'
import Image from 'next/image'
import Link from 'next/link'

const ProposalBasicInfo = ({ proposal }: { proposal: Proposal }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 print:text-black'>
      {/* Company Info */}
      <div className='flex flex-col text-sm'>
        {/* Company or Location Logo */}
        <Link href={'/erp'} className=''>
          <Image
            src={
              proposal?.estimate?.location?.is_branding
                ? (generateFileUrl(proposal?.estimate?.location?.logo) ?? '/images/dashboard/logo.webp')
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
        {proposal?.estimate?.location?.name && <p className='font-semibold'>{proposal?.estimate?.location?.name}</p>}
        {/* Location Address */}
        {proposal?.estimate?.location?.street_address && (
          <p>
            {proposal?.estimate?.location?.street_address}
            <br />
            {proposal?.estimate?.location?.city?.name}
            {proposal?.estimate?.location?.state && ','} {proposal?.estimate?.location?.state?.name}
            {proposal?.estimate?.location?.zip_code && ','} {proposal?.estimate?.location?.zip_code}
          </p>
        )}
        {/* Location Website */}
        {proposal?.estimate?.location?.website && <p>{proposal?.estimate?.location?.website}</p>}
        {/* Assign User Email */}
        {proposal?.estimate?.assign_user?.email && <p>Email: {proposal?.estimate?.assign_user?.email}</p>}
        {/* Assign User Phone */}
        {proposal?.estimate?.assign_user?.userable?.phone && (
          <p>Phone: {proposal?.estimate?.assign_user?.userable?.phone}</p>
        )}
      </div>
      {/* Proposal Info */}
      <div className='flex flex-col sm:text-right text-sm'>
        <h6 className='semibold text-2xl'>PROPOSAL</h6>
        <p>Proposal #{String(proposal?.proposal_number)}</p>
        <p>Date: {formatDate(new Date(proposal?.created_at))}</p>
      </div>
    </div>
  )
}

export default ProposalBasicInfo
