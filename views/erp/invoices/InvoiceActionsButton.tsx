import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Invoice } from '@/types'
import { Check, ChevronDownIcon, Eye, Mail } from 'lucide-react'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

const InvoiceActionsButton = ({
  invoice,
  isMarkingAsSigned,
  isSendingEmail,
  onViewEditDetails,
  onViewWorkOrder,
  onMarkAsSigned,
  onConfirmedEmailSend
}: {
  invoice: Invoice
  isMarkingAsSigned: boolean
  isSendingEmail: boolean
  onViewEditDetails: () => void
  onViewWorkOrder?: () => void
  onMarkAsSigned: () => void
  onConfirmedEmailSend: () => Promise<void>
}) => {
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' variant='outline' size='default'>
            Invoice Actions
            <ChevronDownIcon className='h-4 w-4 ml-2' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={onViewEditDetails}>
            <Eye className='mr-2 h-4 w-4' />
            View/Edit Invoice Details
          </DropdownMenuItem>
          {invoice?.work_order_id && onViewWorkOrder && (
            <DropdownMenuItem onClick={onViewWorkOrder}>
              <Eye className='mr-2 h-4 w-4' />
              View Work Order
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setConfirmEmailOpen(true)} disabled={isSendingEmail}>
            <Mail className='mr-2 h-4 w-4' />
            {isSendingEmail ? 'Sending...' : 'Email Invoice to Customer'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onMarkAsSigned} disabled={isSendingEmail}>
            <Check className='mr-2 h-4 w-4' />
            {isMarkingAsSigned ? 'Marking...' : 'Mark Invoice as Signed'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmEmailOpen}
        onOpenChange={setConfirmEmailOpen}
        title='Send Email to Customer'
        message='This action will save the current invoice and send an email to the customer. If you would not like to save the invoice, click Cancel. Click OK to save and send the invoice.'
        confirmButtonTitle='OK'
        loading={isSendingEmail}
        onConfirm={async () => {
          await onConfirmedEmailSend()
          setConfirmEmailOpen(false)
        }}
      />
    </>
  )
}

export default InvoiceActionsButton
