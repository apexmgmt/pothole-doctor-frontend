import ScheduleCalendar from '@/views/erp/Schedules/ScheduleCalendar'
import ClientService from '@/services/api/clients/clients.service'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import PartnerService from '@/services/api/partners/partners.service'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'

const ScheduleCalendarPage = async () => {
  const [clientsResponse, workOrdersResponse, serviceTypesResponse, partnersResponse] = await Promise.allSettled([
    ClientService.getAll('customer'),
    WorkOrderService.getAll(),
    ServiceTypeService.getAll(),
    PartnerService.getAll()
  ])

  const clients: Client[] = clientsResponse.status === 'fulfilled' ? (clientsResponse.value?.data ?? []) : []

  const workOrders: WorkOrder[] =
    workOrdersResponse.status === 'fulfilled' ? (workOrdersResponse.value?.data ?? []) : []

  const serviceTypes: ServiceType[] =
    serviceTypesResponse.status === 'fulfilled' ? (serviceTypesResponse.value?.data ?? []) : []

  const partners: Partner[] = partnersResponse.status === 'fulfilled' ? (partnersResponse.value?.data ?? []) : []

  // sort by first_name and last_name if not empty
  partners.sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim()
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim()

    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })

  return <ScheduleCalendar clients={clients} workOrders={workOrders} serviceTypes={serviceTypes} partners={partners} />
}

export default ScheduleCalendarPage
