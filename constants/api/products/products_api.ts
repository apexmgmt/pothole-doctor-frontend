/**
 * API endpoint constants for products.
 *
 * Data table operation method: GET
 *
 * Data create method: POST
 *
 * Data update method: PUT /{id}
 *
 * Data retrieve method: GET /{id}
 *
 * Data delete method: DELETE /{id}
 *
 * Data restore method: POST /{id}/restore
 */
export const PRODUCTS: string = '/v1/products/'
export const NON_INVENTORY_PRODUCTS: string = '/v1/non-inventory-products/'

export const PRODUCTS_TENANT: string = '/v1/tenant/products/'
export const NON_INVENTORY_PRODUCTS_TENANT: string = '/v1/tenant/non-inventory-products/'

export const PRODUCTS_ALL: string = '/v1/get-products/'
export const PRODUCTS_ALL_TENANT: string = '/v1/tenant/get-products/'

export const NON_INVENTORY_PRODUCTS_ALL: string = '/v1/get-non-inventory-products/'
export const NON_INVENTORY_PRODUCTS_ALL_TENANT: string = '/v1/tenant/get-non-inventory-products/'

/**
 * Delete bulk products {ids: []}
 *
 * @example
 *  const payload = { ids: ['uuid1', 'uuid2', 'uuid3'] }
 * @method DELETE
 */
export const PRODUCTS_BULK_DELETE: string = '/v1/products/bulk-delete',
  PRODUCTS_BULK_DELETE_TENANT: string = '/v1/tenant/products/bulk-delete',
  NON_INVENTORY_PRODUCTS_BULK_DELETE: string = '/v1/non-inventory-products/bulk-delete',
  NON_INVENTORY_PRODUCTS_BULK_DELETE_TENANT: string = '/v1/tenant/non-inventory-products/bulk-delete'

/**
 * Edit bulk products {changes: []}
 *
 * @example
 *  const payload = { changes: [{ id: 'uuid1', product_cost: 10, margin: 20 }] }
 * @method PUT
 */
export const PRODUCTS_BULK_EDIT: string = '/v1/products/bulk-edit',
  PRODUCTS_BULK_EDIT_TENANT: string = '/v1/tenant/products/bulk-edit',
  NON_INVENTORY_PRODUCTS_BULK_EDIT: string = '/v1/non-inventory-products/bulk-edit',
  NON_INVENTORY_PRODUCTS_BULK_EDIT_TENANT: string = '/v1/tenant/non-inventory-products/bulk-edit'

/**
 * Update bulk products {ids: [uuid1, uuid2, uuid3], changes: {margin: 20, product_cost: 10, is_freight_percentage: boolean, freight_amount: number, status: boolean, is_update_all_product_for_vendor: boolean, is_update_all_product_for_category: boolean}, vendor_id: string | null, category_id: string | null}
 *
 * @example
 *  const payload = {ids: [uuid1, uuid2, uuid3], changes: {margin: 20, product_cost: 10, is_freight_percentage: boolean, freight_amount: number, status: boolean, is_update_all_product_for_vendor: boolean, is_update_all_product_for_category: boolean}, vendor_id: string | null, category_id: string | null}
 * @method PUT
 */
export const PRODUCTS_BULK_UPDATE: string = '/v1/products/bulk-update',
  PRODUCTS_BULK_UPDATE_TENANT: string = '/v1/tenant/products/bulk-update',
  NON_INVENTORY_PRODUCTS_BULK_UPDATE: string = '/v1/non-inventory-products/bulk-update',
  NON_INVENTORY_PRODUCTS_BULK_UPDATE_TENANT: string = '/v1/tenant/non-inventory-products/bulk-update'

/**
 * API endpoint for product galleries
 *
 * Data table operation method: GET
 *
 * Data create method: POST
 *
 * Data update method: PUT /{id} {POST - _method=PUT}
 *
 * Data delete method: DELETE /{id}
 */
export const PRODUCTS_GALLERIES: string = '/v1/galleries/',
  PRODUCTS_GALLERIES_TENANT: string = '/v1/tenant/galleries/'
