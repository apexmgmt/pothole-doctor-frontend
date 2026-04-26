/**
 * API endpoint constants for vendors.
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
export const VENDORS: string = '/v1/vendors/'
export const VENDORS_TENANT: string = '/v1/tenant/vendors/'
export const VENDORS_ALL: string = '/v1/get-vendors/'
export const VENDORS_ALL_TENANT: string = '/v1/tenant/get-vendors/'

/**
 * API endpoint for vendor documents
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
 */
export const VENDOR_DOCUMENTS: string = '/v1/vendor-documents/'
export const VENDOR_DOCUMENTS_TENANT: string = '/v1/tenant/vendor-documents/'

/**
 * API endpoint for vendor rebates and credits
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
 */
export const VENDOR_REBATE_CREDITS: string = '/v1/rebate-credits/'
export const VENDOR_REBATE_CREDITS_TENANT: string = '/v1/tenant/rebate-credits/'

/**
 * API endpoint for vendor pickup addresses
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
 */
export const VENDOR_PICKUP_ADDRESSES: string = '/v1/pickup-addresses/'
export const VENDOR_PICKUP_ADDRESSES_TENANT: string = '/v1/tenant/pickup-addresses/'

/**
 * API endpoint for vendor sales-man
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
 */
export const VENDOR_SALESMAN: string = '/v1/sales-man/'
export const VENDOR_SALESMAN_TENANT: string = '/v1/tenant/sales-man/'
