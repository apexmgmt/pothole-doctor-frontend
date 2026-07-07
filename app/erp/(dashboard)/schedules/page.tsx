import PartnerService from '@/services/api/partners/partners.service'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import { Partner, WorkOrder, DataTableApiResponse } from '@/types'
import { Schedule } from '@/types/schedules'
import Schedules from '@/views/erp/Schedules'
import ScheduleService from '@/services/api/schedules.service'
import { hasPermission } from '@/utils/role-permission'

const ScheduleListPage = async ({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const resolvedSearchParams = await searchParams

  const [workOrdersRes, partnersRes] = await Promise.allSettled([WorkOrderService.getAll(), PartnerService.getAll()])

  let responseData: any = null

  try {
    const response = await ScheduleService.index(resolvedSearchParams as Record<string, string>)

    responseData = response || null
  } catch (error) {
    console.error('Failed to fetch schedules:', error)
  }

  const [canCreate, canView, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Schedule'),
    hasPermission('View Schedule'),
    hasPermission('Update Schedule'),
    hasPermission('Delete Schedule')
  ])

  const workOrders: WorkOrder[] = workOrdersRes.status === 'fulfilled' ? workOrdersRes.value.data : []
  const partners: Partner[] = partnersRes.status === 'fulfilled' ? partnersRes.value.data : []

  return (
    <Schedules
      workOrders={workOrders}
      partners={partners}
      initialData={responseData}
      permissions={{ canCreate, canView, canEdit, canDelete }}
    />
  )
}

export default ScheduleListPage
