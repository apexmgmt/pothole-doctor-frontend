import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import LaborCostService from '@/services/api/labor_costs.service'
import { ServiceType, Unit, DataTableApiResponse, LaborCost } from '@/types'
import LaborCosts from '@/views/erp/labor-costs/LaborCosts'

export const dynamic = 'force-dynamic'

export default async function LaborCostsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const [serviceTypesRes, unitsRes] = await Promise.allSettled([ServiceTypeService.getAll(), UnitService.getAll()])

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  let responseData: DataTableApiResponse<LaborCost> | null = null

  try {
    const response = await LaborCostService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch labor costs:', error)
  }

  return <LaborCosts serviceTypes={serviceTypes} units={units} initialData={responseData} />
}
