import ServiceTypes from '@/views/erp/settings/service-types/ServiceTypes'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, ServiceType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ServiceTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<ServiceType> | null = null

  try {
    const response = await ServiceTypeService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch service types:', error)
  }

  const [canCreateType, canEditType, canDeleteType, canRestoreType] = await Promise.all([
    hasPermission('Create Service Type'),
    hasPermission('Update Service Type'),
    hasPermission('Delete Service Type'),
    hasPermission('Restore Service Type')
  ])

  return (
    <ServiceTypes
      initialData={initialData}
      permissions={{ canCreateType, canEditType, canDeleteType, canRestoreType }}
    />
  )
}
