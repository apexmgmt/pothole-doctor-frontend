import PartnerTypes from '@/views/erp/settings/partner-types/PartnerTypes'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import { DataTableApiResponse, PartnerType } from '@/types'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function PartnerTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let responseData: DataTableApiResponse<PartnerType> | null = null

  try {
    const response = await PartnerTypesService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch contractor types:', error)
  }

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Contractor Type'),
    hasPermission('Update Contractor Type'),
    hasPermission('Delete Contractor Type')
  ])

  return (
    <PartnerTypes
      initialData={responseData}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  )
}
