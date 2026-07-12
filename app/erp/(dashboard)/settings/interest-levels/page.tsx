import InterestLevels from '@/views/erp/leads/interest-levels/InterestLevels'
import InterestLevelService from '@/services/api/interest_levels.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, InterestLevel } from '@/types'

export const dynamic = 'force-dynamic'

export default async function InterestLevelsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<InterestLevel> | null = null

  try {
    const response = await InterestLevelService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch interest levels:', error)
  }

  const [canCreateLevel, canEditLevel, canDeleteLevel] = await Promise.all([
    hasPermission('Create Interest Level'),
    hasPermission('Update Interest Level'),
    hasPermission('Delete Interest Level')
  ])

  return <InterestLevels initialData={initialData} permissions={{ canCreateLevel, canEditLevel, canDeleteLevel }} />
}
