/**
 * API endpoint constants for tasks-related operations.
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
export const TASKS: string = '/v1/tasks/'
export const TASKS_TENANT: string = '/v1/tenant/tasks/'
export const TASKS_ALL: string = '/v1/get-tasks/'
export const TASKS_ALL_TENANT: string = '/v1/tenant/get-tasks/'
