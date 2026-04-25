export interface ProductCategory {
  id: string
  name: string
  type: string
  created_at: string
  updated_at: string
}

export interface ProductCategoryPayload {
  name: string
  type: string
}
