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
