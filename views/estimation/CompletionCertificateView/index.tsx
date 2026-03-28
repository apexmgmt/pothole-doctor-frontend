'use client'

import { useRef, useState } from 'react'
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
}

const CompletionCertificateView = ({ workOrder, service, completionCertificate, wo_id, st_id }: Props) => {
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

      const formData = new FormData()

      formData.append('wo_id', wo_id)
      formData.append('st_id', st_id)
      formData.append('is_completed', '1')

      if (signatureDataUrl) {
        const res = await fetch(signatureDataUrl)
        const blob = await res.blob()

        formData.append('signature', blob, `signature-${wo_id}.png`)
      }

      if (checklistValues) {
        if (checklistValues.isSatisfied !== null) {
          formData.append('is_satisfied', checklistValues.isSatisfied ? 'true' : 'false')
        }

        if (checklistValues.rating) formData.append('rating', checklistValues.rating)

        if (checklistValues.paymentMethod) formData.append('payment_method', checklistValues.paymentMethod)

        if (checklistValues.amountToCharge) formData.append('amount_to_charge', checklistValues.amountToCharge)
      }

      await WorkOrderService.completeWorkOrder(formData)

      setIsCompleted(true)
      toast.success('Completion certificate submitted successfully!')
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
          initialPaymentMethod={workOrder.payment_method ?? null}
          initialPaymentData={workOrder.payment_method_data ?? null}
        />
        <Separator className='my-4 bg-[#e5e7eb]' />
        {/* Signature + Date */}
        <CertificateSignature
          ref={signatureRef}
          onSignedChange={setIsSigned}
          readOnly={!canShowSubmit}
          date={completionDate}
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
