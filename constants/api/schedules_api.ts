/**
 * API endpoint constants for schedule-related operations.
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
export const SCHEDULES: string = '/v1/tenant/schedules/'

/**
 * API endpoint for retrieving all schedules.
 */
export const SCHEDULES_ALL: string = '/v1/get-schedules/'
