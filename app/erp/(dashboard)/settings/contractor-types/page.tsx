import PartnerTypes from '@/views/erp/settings/partner-types/PartnerTypes'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import { DataTableApiResponse, PartnerType } from '@/types'

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

  return <PartnerTypes initialData={responseData} />
}
