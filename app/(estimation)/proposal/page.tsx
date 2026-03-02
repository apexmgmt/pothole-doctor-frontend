import ProposalService from '@/services/api/estimates/proposals.service'
import { Proposal, ProposalHistory } from '@/types'
import ProposalView from '@/views/estimation/ProposalView'
export const dynamic = 'force-dynamic'

const ProposalDetailsPage = async ({ searchParams }: { searchParams: any }) => {
  // get the token and proposal id from search params
  const { p_id, qc_id, iscus } = await searchParams
  let proposal: Proposal | null = null
  let proposalHistories: ProposalHistory[] = []

  try {
    const response = await ProposalService.viewProposal(p_id, qc_id, iscus)

    proposal = response?.data?.proposal ?? null
    proposalHistories = response?.data?.histories ?? []
  } catch (error) {
    console.log('Error fetching proposal details, using demo data', error)
    proposal = null
    proposalHistories = []
  }

  if (!proposal) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Proposal Not Found</h2>
        <p className='text-gray-600'>The proposal you are looking for does not exist or has been deleted.</p>
      </div>
    )
  }

  return <ProposalView proposal={proposal} proposalHistories={proposalHistories} />
}

export default ProposalDetailsPage
