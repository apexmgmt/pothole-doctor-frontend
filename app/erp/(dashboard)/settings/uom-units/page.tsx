import Units from '@/views/erp/settings/units/Units'
import UnitService from '@/services/api/settings/units.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, Unit } from '@/types'

export const dynamic = 'force-dynamic'

export default async function UomUnitsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  // ensure group is set to uom
  const query = {
    ...(resolvedSearchParams as Record<string, string>),
    group: 'uom'
  }

  let initialData: DataTableApiResponse<Unit> | null = null

  try {
    const response = await UnitService.index(query)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch uom units:', error)
  }

  const [canCreateUnit, canEditUnit, canDeleteUnit] = await Promise.all([
    hasPermission('Create Uom Unit'),
    hasPermission('Update Uom Unit'),
    hasPermission('Delete Uom Unit')
  ])

  return <Units group='uom' initialData={initialData} permissions={{ canCreateUnit, canEditUnit, canDeleteUnit }} />
}
