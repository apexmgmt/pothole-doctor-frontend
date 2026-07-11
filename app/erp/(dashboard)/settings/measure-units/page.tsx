import Units from '@/views/erp/settings/units/Units'
import UnitService from '@/services/api/settings/units.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, Unit } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MeasureUnitsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  // ensure group is set to measure
  const query = {
    ...(resolvedSearchParams as Record<string, string>),
    group: 'measure'
  }

  let initialData: DataTableApiResponse<Unit> | null = null

  try {
    const response = await UnitService.index(query)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch measure units:', error)
  }

  const [canCreateUnit, canEditUnit, canDeleteUnit] = await Promise.all([
    hasPermission('Create Measure Unit'),
    hasPermission('Update Measure Unit'),
    hasPermission('Delete Measure Unit')
  ])

  return <Units group='measure' initialData={initialData} permissions={{ canCreateUnit, canEditUnit, canDeleteUnit }} />
}
