import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import { CompletionCertificate, WorkOrder } from '@/types'
import { ProposalService } from '@/types/estimates/proposals'
import CompletionCertificateView from '@/views/estimation/CompletionCertificateView'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ searchParams }: { searchParams: any }): Promise<Metadata> => {
  const { wo_id, st_id } = await searchParams

  try {
    const response = await WorkOrderService.viewWorkOrder(wo_id, st_id)
    const workOrder: WorkOrder | null = response?.data?.work_order ?? null

    if (!workOrder) {
      return { title: 'Work Order Not Found' }
    }

    const workOrderNumber = workOrder.work_order_number?.toString().padStart(6, '0') ?? ''

    const clientName = [workOrder.client?.first_name, workOrder.client?.last_name].filter(Boolean).join(' ')

    const title = `Completion Certificate #${workOrderNumber}${clientName ? ` — ${clientName}` : ''} (Pothole Doctor)`

    const description = workOrder.message
      ? workOrder.message.slice(0, 160)
      : `Review completion certificate #${workOrderNumber} from Pothole Doctor.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website'
      }
    }
  } catch {
    return { title: 'Completion Certificate' }
  }
}

const CompletionCertificatePage = async ({ searchParams }: { searchParams: any }) => {
  const { wo_id, st_id } = await searchParams

  let workOrder: WorkOrder | null = null
  let service: ProposalService | null = null
  let completionCertificate: CompletionCertificate | null = null

  try {
    const response = await WorkOrderService.viewWorkOrder(wo_id, st_id)

    console.log('response', response)

    workOrder = response?.data?.work_order ?? null
    service = response?.data?.service ?? null
    completionCertificate = response?.data?.completion_certificate ?? null
  } catch (error) {
    console.log('Error fetching work order details', error)
    workOrder = null
  }

  if (!workOrder) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Work Order Not Found</h2>
        <p className='text-gray-600'>The work order you are looking for does not exist or has been deleted.</p>
      </div>
    )
  }

  return (
    <CompletionCertificateView
      workOrder={workOrder}
      service={service}
      completionCertificate={completionCertificate}
      wo_id={wo_id ?? ''}
      st_id={st_id ?? ''}
    />
  )
}

export default CompletionCertificatePage
