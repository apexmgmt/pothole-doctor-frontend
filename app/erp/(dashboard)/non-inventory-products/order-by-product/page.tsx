import OrderByProduct from '@/views/erp/non-inventory-jobs/OrderByProduct'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { DataTableApiResponse, MaterialJob } from '@/types'

export const dynamic = 'force-dynamic'

export default async function OrderByProductPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<MaterialJob> | null = null

  try {
    const response = await MaterialJobService.index({ ...resolvedSearchParams, job_type: 'non_inventory' })

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch non-inventory jobs for order by product:', error)
  }

  return <OrderByProduct initialData={responseData} />
}
