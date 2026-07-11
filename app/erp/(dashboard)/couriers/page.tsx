import Couriers from '@/views/erp/couriers/Couriers'
import CourierService from '@/services/api/couriers.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, Courier } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CouriersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<Courier> | null = null

  try {
    const response = await CourierService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch couriers:', error)
  }

  const [canCreateCourier, canViewCourier, canEditCourier, canDeleteCourier] = await Promise.all([
    hasPermission('Create Courier'),
    hasPermission('View Courier'),
    hasPermission('Update Courier'),
    hasPermission('Delete Courier')
  ])

  return (
    <Couriers
      initialData={responseData}
      permissions={{ canCreateCourier, canViewCourier, canEditCourier, canDeleteCourier }}
    />
  )
}
