import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import { ServiceType, Unit } from '@/types'
import LaborCosts from '@/views/erp/labor-costs/LaborCosts'

export const dynamic = 'force-dynamic'

export default async function LaborCostsPage() {
  const [serviceTypesRes, unitsRes] = await Promise.allSettled([ServiceTypeService.getAll(), UnitService.getAll()])

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  return <LaborCosts serviceTypes={serviceTypes} units={units} />
}
