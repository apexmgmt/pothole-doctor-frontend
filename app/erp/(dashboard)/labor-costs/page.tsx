import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import { ServiceType, Unit } from '@/types'
import LaborCosts from '@/views/erp/labor-costs/LaborCosts'

export default async function LaborCostsPage() {
  let serviceTypes: ServiceType[] = []
  let units: Unit[] = []

  try {
    const response = await ServiceTypeService.getAll()

    serviceTypes = response.data || []
  } catch (error) {
    serviceTypes = []
  }

  try {
    const response = await UnitService.getAll()

    units = response.data || []
  } catch (error) {
    units = []
  }

  return <LaborCosts serviceTypes={serviceTypes} units={units} />
}
