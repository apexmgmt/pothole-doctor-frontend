import PartnerService from "@/services/api/partners/partners.service"
import WorkOrderService from "@/services/api/work-orders/work_orders.service"
import { Partner, WorkOrder } from "@/types"
import Schedules from "@/views/erp/Schedules"

const ScheduleListPage = async () => {
  const [workOrdersRes, partnersRes,] = await Promise.allSettled([
    WorkOrderService.getAll(),
    PartnerService.getAll()
  ])  

  const workOrders: WorkOrder[] = workOrdersRes.status === 'fulfilled' ? workOrdersRes.value.data : []
  const partners: Partner[] = partnersRes.status === 'fulfilled' ? partnersRes.value.data : []

  return (
    <Schedules workOrders={workOrders} partners={partners} />
  )
}

export default ScheduleListPage

