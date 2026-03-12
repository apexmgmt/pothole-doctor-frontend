import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDown, FileStack, Mail, MessageSquare, Ban, Skull, RotateCcw, Check } from 'lucide-react'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { toast } from 'sonner'
import ProposalHistoryModal from './ProposalHistoryModal'
import ProposalService from '@/services/api/estimates/proposals.service'
import VoidDeadProposalModal, { VoidDeadAction } from './VoidDeadProposalModal'

const ProposalActionsDropdown = ({
  onConfirmedEmailSend,
  isSending,
  proposalId,
  proposalStatus,
  onStatusChange,
  onReasonChange,
  onSuccess,
  onPaymentSettingClick,
  mode = 'create'
}: {
  onConfirmedEmailSend: () => Promise<void>
  isSending: boolean
  proposalId?: string | null
  proposalStatus?: string | null
  onStatusChange?: (status: string) => void
  onReasonChange?: (reason: string | null) => void
  onSuccess?: () => void
  onPaymentSettingClick?: () => void
  mode: 'create' | 'edit' | 'view'
}) => {
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [voidDeadAction, setVoidDeadAction] = useState<VoidDeadAction | null>(null)

  // Reopen confirm state
  const [confirmReopenOpen, setConfirmReopenOpen] = useState(false)
  const [reopenLoading, setReopenLoading] = useState(false)

  const isConvertedToInvoice = proposalStatus === 'converted to invoice'
  const isVoidOrDead = proposalStatus === 'void proposal' || proposalStatus === 'dead proposal'

  const handleSmsProposal = () => {
    toast.info('SMS feature coming soon')
  }

  const handleReopen = async () => {
    if (!proposalId) return

    setReopenLoading(true)

    try {
      await ProposalService.reopen(proposalId)
      toast.success('Proposal reopened successfully')
      onStatusChange?.('reopened')
      onReasonChange?.(null)
      setConfirmReopenOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reopen proposal')
    } finally {
      setReopenLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' type='button' disabled={isSending}>
            Actions
            <ChevronDown className='h-4 w-4 ml-2' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setConfirmEmailOpen(true)} disabled={isSending || isVoidOrDead}>
            <Mail className='mr-2 h-4 w-4' />
            Email Proposal to Customer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSmsProposal} disabled={isVoidOrDead}>
            <MessageSquare className='mr-2 h-4 w-4' />
            SMS Proposal to Customer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHistoryModalOpen(true)} disabled={!proposalId}>
            <FileStack className='mr-2 h-4 w-4' />
            View Proposal Versions
          </DropdownMenuItem>
          {proposalId && mode === 'view' && (
            <DropdownMenuItem onClick={onPaymentSettingClick}>
              <Check className='mr-2 h-4 w-4' />
              Payment Setting
            </DropdownMenuItem>
          )}

          {!isConvertedToInvoice && proposalId && (
            <>
              <DropdownMenuSeparator />
              {!isVoidOrDead && (
                <>
                  <DropdownMenuItem
                    onClick={() => setVoidDeadAction('void')}
                    className='text-yellow-500 focus:text-yellow-500'
                  >
                    <Ban className='mr-2 h-4 w-4' />
                    Void Proposal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setVoidDeadAction('dead')}
                    className='text-red-500 focus:text-red-500'
                  >
                    <Skull className='mr-2 h-4 w-4' />
                    Dead Proposal
                  </DropdownMenuItem>
                </>
              )}
              {isVoidOrDead && (
                <DropdownMenuItem
                  onClick={() => setConfirmReopenOpen(true)}
                  className='text-green-500 focus:text-green-500'
                >
                  <RotateCcw className='mr-2 h-4 w-4' />
                  Reopen Proposal
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email confirm dialog */}
      <ConfirmDialog
        open={confirmEmailOpen}
        onOpenChange={setConfirmEmailOpen}
        title='Send Email to Customer'
        message='This action will save the current proposal, and send an email to the customer. If you would not like to save the proposal, click the Cancel button. Click OK to save and send the proposal.'
        confirmButtonTitle='OK'
        loading={isSending}
        onConfirm={async () => {
          await onConfirmedEmailSend()
          setConfirmEmailOpen(false)
        }}
      />

      {/* Proposal history modal */}
      {proposalId && (
        <ProposalHistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} proposalId={proposalId} />
      )}

      {/* Void / Dead reason modal */}
      {proposalId && (
        <VoidDeadProposalModal
          action={voidDeadAction}
          proposalId={proposalId}
          onClose={() => setVoidDeadAction(null)}
          onSuccess={(status, reason) => {
            onStatusChange?.(status)
            onReasonChange?.(reason)
            setVoidDeadAction(null)
            onSuccess?.()
          }}
        />
      )}

      {/* Reopen confirm dialog */}
      <ConfirmDialog
        open={confirmReopenOpen}
        onOpenChange={setConfirmReopenOpen}
        title='Reopen Proposal'
        message='Are you sure you want to reopen this proposal? Its status will be reset to new.'
        confirmButtonTitle='Reopen'
        loading={reopenLoading}
        onConfirm={handleReopen}
      />
    </>
  )
}

export default ProposalActionsDropdown
