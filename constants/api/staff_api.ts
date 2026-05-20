/**
 * API endpoint constants for Staff-related operations.
 *
 * @method: GET - Retrieve staffs data table.
 *
 * @method: POST - Create a new staff entry.
 *
 * @method: GET - Retrieve a specific staff entry by ID. /id
 *
 * @method: PUT - Update an existing staff entry. /id
 *
 * @method: DELETE - Remove a specific staff entry by ID. /id
 */
export const STAFFS: string = '/v1/staffs/'
export const STAFFS_TENANT: string = '/v1/tenant/staffs/'
export const STAFFS_ALL: string = '/v1/get-staffs'
export const STAFFS_ALL_TENANT: string = '/v1/tenant/get-staffs'

/**
 * @method: PUT - Change password for a specific staff entry by ID. /id
 * @request: {password, password_confirmation}
 */
export const STAFF_CHANGE_PASSWORD: string = '/v1/staff-password-change/' // + staffId
export const STAFF_CHANGE_PASSWORD_TENANT: string = '/v1/tenant/staff-password-change/' // + staffId
