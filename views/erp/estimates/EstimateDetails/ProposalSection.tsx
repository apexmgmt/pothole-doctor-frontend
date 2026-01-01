import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect, useRef, useCallback } from 'react'
import CreateOrEditProposalModal from './CreateOrEditProposalModal'
import { Estimate } from '@/types/estimates.types'
import { DataTableApiResponse, ProductCategory, ServiceType, Unit, Vendor, Proposal } from '@/types'
import ProposalService from '@/services/api/proposals.service'
import { SpinnerCustom } from '@/components/ui/spinner'

type ProposalModalModeType = 'create' | 'edit' | 'view'

const ProposalSection = ({
  estimateId,
  estimateDetails,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = []
}: {
  estimateId: string
  estimateDetails: Estimate
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [filterOptions, setFilterOptions] = useState<any>({
    estimate_id: estimateId,
    per_page: 10,
    page: 1
  })

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalModalMode, setProposalModalMode] = useState<ProposalModalModeType>('create')
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProposalId(null)
    setSelectedProposal(null)
  }

  // Fetch data from API
  const fetchData = useCallback(
    async (page: number = 1) => {
      // Stop if no more pages
      if (!hasMore && page > 1) return

      setIsLoading(true)

      try {
        const response = await ProposalService.index({
          ...filterOptions,
          page
        })

        if (response.data) {
          if (page === 1) {
            // First page: replace data
            setProposals(response.data.data || [])
          } else {
            // Append new data
            setProposals(prev => [...prev, ...(response.data.data || [])])
          }

          setCurrentPage(page)

          // Check if more pages exist
          setHasMore(page < response.data.last_page)
        }
      } catch (error) {
        console.error('Error fetching proposals:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [filterOptions, hasMore]
  )

  // Fetch initial data
  useEffect(() => {
    fetchData(1)
  }, [filterOptions])

  // Infinity scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          fetchData(currentPage + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasMore, currentPage, fetchData])

  // open proposal modal
  const handleOpenProposalModal = (mode: ProposalModalModeType, proposal?: Proposal) => {
    setProposalModalMode(mode)

    if (proposal) {
      setSelectedProposalId(proposal.id)
      setSelectedProposal(proposal)
    } else {
      setSelectedProposalId(null)
      setSelectedProposal(null)
    }

    setIsModalOpen(true)
  }

  // Add this inside ProposalSection
  const refreshProposals = () => {
    fetchData(1)
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-white text-base'>Proposals</CardTitle>
          <Button
            onClick={() => handleOpenProposalModal('create')}
            size='sm'
            variant='outline'
            className='text-xs px-3 py-1 bg-white text-black'
          >
            + New
          </Button>
        </CardHeader>
        <CardContent className='relative'>
          <ScrollArea className={`w-full rounded-md ${proposals.length === 0 ? 'h-32' : 'h-[80vh]'}`}>
            <div className='space-y-4'>
              {proposals.length === 0 && !isLoading ? (
                <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md'>
                  <span className='text-zinc-400 text-sm'>No Proposals</span>
                </div>
              ) : (
                <>
                  {proposals.map((proposal, idx) => (
                    <div key={proposal.id} className='border border-zinc-700 rounded-lg p-4 bg-zinc-800'>
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <h3 className='text-white font-semibold text-sm mb-1'>
                            Proposal: #{proposal.proposal_number?.toString().padStart(6, '0') || 'N/A'}
                          </h3>
                          <p className='text-zinc-300 text-sm font-medium'>{proposal.estimate?.title}</p>
                        </div>
                        <Badge variant={'default'}>{proposal.estimate?.status}</Badge>
                      </div>

                      <div className='space-y-2 mb-3 border-t border-zinc-700 pt-3'>
                        {proposal.message && (
                          <div>
                            <span className='text-zinc-400 text-xs'>Message</span>
                            <p className='text-zinc-200 text-sm'>{proposal.message}</p>
                          </div>
                        )}

                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          <div>
                            <span className='text-zinc-400'>Created</span>
                            <p className='text-zinc-200'>{new Date(proposal.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className='text-zinc-400'>Updated</span>
                            <p className='text-zinc-200'>{new Date(proposal.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className='flex justify-between items-end border-t border-zinc-700 pt-3'>
                        <div>
                          <span className='text-zinc-400 text-xs'>Total</span>
                          <p className='text-white font-bold text-lg'>${proposal.total}</p>
                        </div>
                        <div className='flex justify-between gap-2'>
                          <Button
                            onClick={() => handleOpenProposalModal('edit', proposal)}
                            size='sm'
                            variant='outline'
                            className='text-xs'
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleOpenProposalModal('view', proposal)}
                            size='sm'
                            variant='outline'
                            className='text-xs'
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Infinity scroll trigger */}
                  <div ref={observerTarget} className='flex justify-center py-1'>
                    {isLoading && (
                      <div className='absolute inset-0 backdrop-blur-xs flex items-center justify-center z-10'>
                        <SpinnerCustom size='size-8' />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <CreateOrEditProposalModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        mode={proposalModalMode}
        proposalId={selectedProposalId}
        proposalDetails={selectedProposal}
        estimateId={estimateId}
        estimateDetails={estimateDetails}
        serviceTypes={serviceTypes}
        units={units}
        productCategories={productCategories}
        uomUnits={uomUnits}
        vendors={vendors}
        onSuccess={refreshProposals}
      />
    </>
  )
}

export default ProposalSection
