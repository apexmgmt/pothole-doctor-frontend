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

/**
 * API endpoint for updating the status of a task on kanban
 * 
 * This endpoint is only works on tenant.
 * This api will also update the orders of the tasks in the columns that it is coming from and going to.
 * If coming from same column, it will update the orders of the task own and the order greater than the task's order in the column.
 * If coming from different column, it will update the orders of the task own and the order greater than the task's order in the column it is coming from and going to.
 * @method PUT
 * @param taskId string
 * @returns '/v1/tenant/tasks/{taskId}/status/'
 */
export const TASKS_STATUS_TENANT = (taskId: string): string => `/v1/tenant/tasks/${taskId}/status/`

/**
 * Task comments API Endpoint
 * 
 * @method GET to get comments of a task
 * @method POST to add comment to a task
 * @method PUT /{commentId} to update a comment of a task
 * @method GET /{commentId} to get a comment of a task
 * @method DELETE /{commentId} to delete a comment of a task
 * @param taskId string
 * @returns 
 */
export const TASKS_COMMENTS = (taskId: string): string => `/v1/tasks/${taskId}/comments/`
