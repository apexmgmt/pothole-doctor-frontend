import ProductCategories from '@/views/erp/product/categories/ProductCategories'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, ProductCategory } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ProductCategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<ProductCategory> | null = null

  try {
    const response = await ProductCategoryService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch product categories:', error)
  }

  const [canCreateCategory, canEditCategory, canDeleteCategory] = await Promise.all([
    hasPermission('Create Product Category'),
    hasPermission('Update Product Category'),
    hasPermission('Delete Product Category')
  ])

  return (
    <ProductCategories
      initialData={initialData}
      permissions={{ canCreateCategory, canEditCategory, canDeleteCategory }}
    />
  )
}
