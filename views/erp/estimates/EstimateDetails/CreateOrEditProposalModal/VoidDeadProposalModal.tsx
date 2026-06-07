import { useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'
import ProposalService from '@/services/api/estimates/proposals.service'
import { toast } from 'sonner'

export type VoidDeadAction = 'void' | 'dead'

interface VoidDeadProposalModalProps {
  action: VoidDeadAction | null
  proposalId: string
  onClose: () => void
  onSuccess: (newStatus: string, reason: string) => void
}

const VoidDeadProposalModal = ({ action, proposalId, onClose, onSuccess }: VoidDeadProposalModalProps) => {
  const [loading, setLoading] = useState(false)
  const [reasonError, setReasonError] = useState('')
  const [reason, setReason] = useState('')

  const title = action === 'void' ? 'Mark Proposal as Void' : action === 'dead' ? 'Mark Proposal as Dead' : ''

  const handleSubmit = async () => {
    const reasonValue = reason.trim()

    if (!reasonValue) {
      setReasonError('Reason is required.')

      return
    }

    if (!action) return

    setLoading(true)

    try {
      await ProposalService.markAsVoidOrDead(proposalId, action, reasonValue)
      const newStatus = action === 'void' ? 'void proposal' : 'dead proposal'

      toast.success(`Proposal marked as ${newStatus} successfully`)
      onSuccess(newStatus, reasonValue)
      onClose()
    } catch (error: any) {
      toast.error(error?.message || `Failed to mark proposal as ${action}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) onClose()
  }

  return (
    <CommonDialog
      open={!!action}
      onOpenChange={handleOpenChange}
      title={title}
      description='Please provide a reason before proceeding.'
      maxWidth='xl'
      isLoading={loading}
      disableClose={loading}
      actions={
        <div className='flex gap-3 w-full'>
          <Button type='button' size='sm' variant='outline' onClick={onClose} disabled={loading} className='flex-1'>
            Cancel
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleSubmit}
            disabled={loading}
            className='flex-1'
            variant={action === 'dead' ? 'destructive' : 'default'}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      }
    >
      <div className='space-y-2'>
        <CustomFormField
          type='textarea'
          name='void-dead-reason'
          label={`Reason for ${action === 'void' ? 'void' : 'dead'} proposal`}
          rules={{ required: true }}
          value={reason}
          onChange={(val: any) => {
             setReason(val)
             if (reasonError) setReasonError('')
          }}
          placeholder='Enter the reason...'

        />
        {reasonError && <p className='text-sm text-red-500'>{reasonError}</p>}
      </div>
    </CommonDialog>
  )
}

export default VoidDeadProposalModal
