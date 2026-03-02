import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Mail, MessageSquare } from 'lucide-react'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { toast } from 'sonner'

const ProposalActionsDropdown = ({
  onConfirmedEmailSend,
  isSending
}: {
  onConfirmedEmailSend: () => Promise<void>
  isSending: boolean
}) => {
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false)

  const handleSmsProposal = () => {
    toast.info('SMS feature coming soon')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' type='button' disabled={isSending}>
            {isSending ? 'Saving...' : 'Send Proposal'}
            <ChevronDown className='h-4 w-4 ml-2' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setConfirmEmailOpen(true)} disabled={isSending}>
            <Mail className='mr-2 h-4 w-4' />
            Email Proposal to Customer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSmsProposal}>
            <MessageSquare className='mr-2 h-4 w-4' />
            SMS Proposal to Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  )
}

export default ProposalActionsDropdown
