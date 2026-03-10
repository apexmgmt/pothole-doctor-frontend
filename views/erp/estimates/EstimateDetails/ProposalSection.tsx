'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect, useRef, useCallback } from 'react'
import CreateOrEditProposalModal from './CreateOrEditProposalModal'
import ProposalAddTaskModal from './ProposalAddTaskModal'
import ProposalTasksModal from './ProposalTasksModal'
import ProposalNotesModal from './ProposalNotesModal'
import ProposalAddNoteModal from './ProposalAddNoteModal'
import { Estimate, ProductCategory, ServiceType, Unit, Vendor, Proposal } from '@/types'
import ProposalService from '@/services/api/estimates/proposals.service'
import { SpinnerCustom } from '@/components/ui/spinner'
import { hasPermission } from '@/utils/role-permission'

import { Settings } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const hasAutoOpenedRef = useRef(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskModalProposalId, setTaskModalProposalId] = useState<string | null>(null)
  const [taskModalClientId, setTaskModalClientId] = useState<string | null>(null)

  const [isTasksListModalOpen, setIsTasksListModalOpen] = useState(false)
  const [tasksListProposalId, setTasksListProposalId] = useState<string | null>(null)

  const [isNotesListModalOpen, setIsNotesListModalOpen] = useState(false)
  const [notesListProposalId, setNotesListProposalId] = useState<string | null>(null)
  const [notesListClientId, setNotesListClientId] = useState<string | null>(null)

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [addNoteProposalId, setAddNoteProposalId] = useState<string | null>(null)
  const [addNoteClientId, setAddNoteClientId] = useState<string | null>(null)

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

  const [canManageProposal, setCanManageProposal] = useState<boolean>(false)
  const [canViewProposal, setCanViewProposal] = useState<boolean>(false)
  const [canCreateProposal, setCanCreateProposal] = useState<boolean>(false)
  const [canEditProposal, setCanEditProposal] = useState<boolean>(false)
  const [canDeleteProposal, setCanDeleteProposal] = useState<boolean>(false)

  // check the permissions initially
  useEffect(() => {
    hasPermission('Manage Proposal').then(result => setCanManageProposal(result))
    hasPermission('View Proposal').then(result => setCanViewProposal(result))
    hasPermission('Create Proposal').then(result => setCanCreateProposal(result))
    hasPermission('Update Proposal').then(result => setCanEditProposal(result))
    hasPermission('Delete Proposal').then(result => setCanDeleteProposal(result))
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProposalId(null)
    setSelectedProposal(null)

    // Remove modal params from URL
    const params = new URLSearchParams(searchParams.toString())

    params.delete('p_mode')
    params.delete('p_id')
    const qs = params.toString()

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
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

  // open proposal modal and sync state to URL
  const handleOpenProposalModal = (mode: ProposalModalModeType, proposal?: Proposal) => {
    setProposalModalMode(mode)

    if (proposal) {
      setSelectedProposalId(proposal.id)
      setSelectedProposal(proposal)
    } else {
      setSelectedProposalId(null)
      setSelectedProposal(null)
    }

    // Persist modal state in URL so refresh restores it
    const params = new URLSearchParams(searchParams.toString())

    params.set('p_mode', mode)

    if (proposal) {
      params.set('p_id', proposal.id)
    } else {
      params.delete('p_id')
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    setIsModalOpen(true)
  }

  // Auto-open modal from URL params after proposals are first loaded
  useEffect(() => {
    if (isLoading || hasAutoOpenedRef.current) return

    const modalMode = searchParams.get('p_mode') as ProposalModalModeType | null
    const modalProposalId = searchParams.get('p_id')

    if (!modalMode) return

    hasAutoOpenedRef.current = true

    if (modalMode === 'create') {
      handleOpenProposalModal('create')

      return
    }

    if (modalProposalId) {
      const found = proposals.find(p => p.id === modalProposalId)

      if (found) {
        handleOpenProposalModal(modalMode, found)
      } else {
        // Not in current page — fetch individually
        ProposalService.show(modalProposalId)
          .then(res => {
            if (res.data) handleOpenProposalModal(modalMode, res.data)
          })
          .catch(() => {})
      }
    }
  }, [isLoading, proposals])

  // Add this function to map status to badge variant
  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    const statusLower = status?.toLowerCase() || ''

    switch (statusLower) {
      case 'new':
        return 'secondary'
      case 'sent to customer':
        return 'warning'
      case 'viewed by customer':
        return 'info'
      case 'converted to invoice':
        return 'default'
      case 'reviewed by customer':
        return 'success'
      case 'void proposal':
      case 'dead proposal':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Add this inside ProposalSection
  const refreshProposals = () => {
    fetchData(1)
  }

  // Send proposal email to customer
  const sendProposalEmail = async (proposalId: string) => {
    try {
      await ProposalService.sendEmail(proposalId)
      refreshProposals()
      toast.success('Proposal email sent successfully')
    } catch (error) {
      toast.error('Failed to send proposal email')
    }
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-white text-base cursor-pointer' onClick={refreshProposals}>
            Proposals{' '}
            {/* <span>
              <RefreshCw className='inline-block cursor-pointer h-4 w-4' onClick={refreshProposals} />
            </span> */}
          </CardTitle>
          {canCreateProposal && (
            <Button
              onClick={() => handleOpenProposalModal('create')}
              size='sm'
              variant='outline'
              className='text-xs px-3 py-1 bg-white text-black'
            >
              + New
            </Button>
          )}
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
                        <Badge className='capitalize' variant={getStatusBadgeVariant(proposal.status)}>
                          {proposal.status}
                        </Badge>
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
                          {(canViewProposal || canEditProposal) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className='p-1.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors'>
                                  <Settings className='h-4 w-4' />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                {canViewProposal && (
                                  <DropdownMenuItem onClick={() => handleOpenProposalModal('view', proposal)}>
                                    View Proposal
                                  </DropdownMenuItem>
                                )}
                                {canEditProposal &&
                                  proposal.status !== 'converted to invoice' &&
                                  proposal.status !== 'void proposal' &&
                                  proposal.status !== 'dead proposal' && (
                                    <DropdownMenuItem onClick={() => handleOpenProposalModal('edit', proposal)}>
                                      Edit Proposal
                                    </DropdownMenuItem>
                                  )}
                                {/* Send email to customer */}
                                {canEditProposal &&
                                  proposal.status !== 'void proposal' &&
                                  proposal.status !== 'dead proposal' && (
                                    <DropdownMenuItem onClick={() => sendProposalEmail(proposal.id)}>
                                      Email to Customer
                                    </DropdownMenuItem>
                                  )}
                                {canEditProposal &&
                                  proposal.status !== 'void proposal' &&
                                  proposal.status !== 'dead proposal' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setTaskModalProposalId(proposal.id)
                                        setTaskModalClientId(proposal.estimate?.client_id ?? null)
                                        setIsTaskModalOpen(true)
                                      }}
                                    >
                                      Add Task
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTasksListProposalId(proposal.id)
                                    setIsTasksListModalOpen(true)
                                  }}
                                >
                                  Tasks
                                </DropdownMenuItem>
                                {canEditProposal &&
                                  proposal.status !== 'void proposal' &&
                                  proposal.status !== 'dead proposal' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setAddNoteProposalId(proposal.id)
                                        setAddNoteClientId(proposal.estimate?.client_id ?? null)
                                        setIsAddNoteModalOpen(true)
                                      }}
                                    >
                                      Add Note
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setNotesListProposalId(proposal.id)
                                    setNotesListClientId(proposal.estimate?.client_id ?? null)
                                    setIsNotesListModalOpen(true)
                                  }}
                                >
                                  Notes
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      {taskModalProposalId && (
        <ProposalAddTaskModal
          open={isTaskModalOpen}
          onOpenChange={open => {
            setIsTaskModalOpen(open)

            if (!open) {
              setTaskModalProposalId(null)
              setTaskModalClientId(null)
            }
          }}
          proposalId={taskModalProposalId}
          clientId={taskModalClientId ?? undefined}
        />
      )}

      {tasksListProposalId && (
        <ProposalTasksModal
          open={isTasksListModalOpen}
          onOpenChange={open => {
            setIsTasksListModalOpen(open)
            if (!open) setTasksListProposalId(null)
          }}
          proposalId={tasksListProposalId}
        />
      )}

      {addNoteProposalId && (
        <ProposalAddNoteModal
          open={isAddNoteModalOpen}
          onOpenChange={open => {
            setIsAddNoteModalOpen(open)

            if (!open) {
              setAddNoteProposalId(null)
              setAddNoteClientId(null)
            }
          }}
          proposalId={addNoteProposalId}
          clientId={addNoteClientId ?? undefined}
          mode='create'
        />
      )}

      {notesListProposalId && (
        <ProposalNotesModal
          open={isNotesListModalOpen}
          onOpenChange={open => {
            setIsNotesListModalOpen(open)

            if (!open) {
              setNotesListProposalId(null)
              setNotesListClientId(null)
            }
          }}
          proposalId={notesListProposalId}
          clientId={notesListClientId ?? undefined}
        />
      )}
    </>
  )
}

export default ProposalSection
