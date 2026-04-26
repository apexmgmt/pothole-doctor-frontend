/**
 * API endpoint for business locations.
 *
 * Data table operation method: GET
 *
 * Data create method: POST
 *
 * Data restore method: POST /{id}/restore
 *
 * Data update method: PUT /{id}
 *
 * Data retrieve method: GET /{id}
 *
 * Data delete method: DELETE /{id}
 */
export const BUSINESS_LOCATIONS: string = '/v1/business-locations/'
export const BUSINESS_LOCATIONS_TENANT: string = '/v1/tenant/business-locations/'
export const BUSINESS_LOCATIONS_ALL: string = '/v1/get-business-locations'
export const BUSINESS_LOCATIONS_ALL_TENANT: string = '/v1/tenant/get-business-locations'
