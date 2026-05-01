import ScheduleCalendar from '@/views/erp/Schedules/ScheduleCalendar'
import ClientService from '@/services/api/clients/clients.service'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import PartnerService from '@/services/api/partners/partners.service'

const ScheduleCalendarPage = async () => {
  const [clientsResponse, workOrdersResponse, serviceTypesResponse, partnersResponse] = await Promise.allSettled([
    ClientService.getAll('customer'),
    WorkOrderService.getAll(),
    ServiceTypeService.getAll(),
    PartnerService.getAll()
  ])

  const clients =
    clientsResponse.status === 'fulfilled' ? (clientsResponse.value?.data ?? clientsResponse.value ?? []) : []

  const workOrders =
    workOrdersResponse.status === 'fulfilled' ? (workOrdersResponse.value?.data ?? workOrdersResponse.value ?? []) : []

  const serviceTypes =
    serviceTypesResponse.status === 'fulfilled'
      ? (serviceTypesResponse.value?.data ?? serviceTypesResponse.value ?? [])
      : []

  const partners =
    partnersResponse.status === 'fulfilled' ? (partnersResponse.value?.data ?? partnersResponse.value ?? []) : []

  return <ScheduleCalendar clients={clients} workOrders={workOrders} serviceTypes={serviceTypes} partners={partners} />
}

export default ScheduleCalendarPage
