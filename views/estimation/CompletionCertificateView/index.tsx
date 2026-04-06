'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { CompletionCertificate, WorkOrder } from '@/types'
import { ProposalService } from '@/types/estimates/proposals'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import { formatDate } from '@/utils/date'
import CertificateActions from './CertificateActions'
import CertificateBasicInfo from './CertificateBasicInfo'
import CertificateChecklistPayment, { CertificateChecklistPaymentHandle } from './CertificateChecklistPayment'
import CertificateCustomerInfo from './CertificateCustomerInfo'
import CertificateSignature, { CertificateSignatureHandle } from './CertificateSignature'

interface Props {
  workOrder: WorkOrder
  service: ProposalService | null
  completionCertificate: CompletionCertificate | null
  wo_id: string
  st_id: string
  sg_id: string
}

const CompletionCertificateView = ({ workOrder, service, completionCertificate, wo_id, st_id, sg_id }: Props) => {
  const router = useRouter()
  const isAlreadyCompleted = completionCertificate?.is_completed ?? false

  const [isSigned, setIsSigned] = useState(isAlreadyCompleted)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted)

  const signatureRef = useRef<CertificateSignatureHandle>(null)
  const checklistRef = useRef<CertificateChecklistPaymentHandle>(null)

  const canSubmit = isSigned
  const canShowSubmit = !isCompleted

  const completionDate = completionCertificate?.updated_at
    ? (formatDate(completionCertificate.updated_at) ?? undefined)
    : undefined

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)

    try {
      const signatureDataUrl = signatureRef.current?.getSignatureDataUrl() ?? null
      const checklistValues = checklistRef.current?.getValues()

      await WorkOrderService.completeWorkOrder({
        wo_id,
        st_id,
        sg_id,
        is_customer_satisfied: checklistValues?.isSatisfied ?? false,
        customer_installation_scale_rate: checklistValues?.rating ? Number(checklistValues.rating) : null,
        payment_method: checklistValues?.paymentMethod ?? 'None',
        payment_method_data: checklistValues?.paymentMethodData ?? null,
        amount_to_charge:
          checklistValues?.paymentMethod === 'None'
            ? 0
            : checklistValues?.amountToCharge
              ? Number(checklistValues.amountToCharge)
              : null,
        signature: signatureDataUrl ?? ''
      })

      setIsCompleted(true)
      toast.success('Completion certificate submitted successfully!')
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit completion certificate')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div>
        {/* Basic Info */}
        <CertificateBasicInfo workOrder={workOrder} />
        <Separator className='mt-4 bg-[#e5e7eb]' />
        {/* Customer & Job Info */}
        <CertificateCustomerInfo workOrder={workOrder} completionCertificate={completionCertificate} />
        <Separator className='my-4 bg-[#e5e7eb]' />
        {/* Customer Checklist and Payment */}
        <CertificateChecklistPayment
          ref={checklistRef}
          total={workOrder?.invoice?.total ?? workOrder?.total ?? 0}
          readOnly={!canShowSubmit}
          initialPaymentMethod={completionCertificate?.payment_method ?? workOrder.payment_method ?? null}
          initialPaymentMethodData={
            ((completionCertificate?.payment_method_data ?? workOrder.payment_method_data) as Record<string, any>) ??
            null
          }
          initialAmountToCharge={completionCertificate?.amount_to_charge ?? workOrder?.total ?? 0}
          initialIsSatisfied={completionCertificate?.is_customer_satisfied ?? null}
          initialRating={completionCertificate?.customer_installation_scale_rate ?? null}
        />
        <Separator className='my-4 bg-[#e5e7eb]' />
        {/* Signature + Date */}
        <CertificateSignature
          ref={signatureRef}
          onSignedChange={setIsSigned}
          readOnly={!canShowSubmit}
          date={completionDate}
          initialSignature={completionCertificate?.signature ?? null}
        />
      </div>
      <Separator className='mb-4' />
      <div>
        <CertificateActions
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          showSubmit={canShowSubmit}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default CompletionCertificateView
