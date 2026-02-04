/**
 * Leads API endpoints
 *
 * @method: GET - Retrieve leads data table.
 *
 * @method: POST - Create a new lead entry.
 *
 * @method: PUT - Update an existing lead entry. /id
 *
 * @method: GET - Retrieve a specific lead entry by ID. /id
 *
 * @method: DELETE - Remove a specific lead entry by ID. /id
 *
 * @method: POST - Restore a deleted lead entry by ID. /id/restore
 */
export const LEADS: string = '/v1/leads/'
export const LEADS_ALL: string = LEADS + '/v1/get-leads/'

/**
 * API endpoint for leads documents
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
export const LEAD_DOCUMENTS: string = '/v1/client-documents/'

/**
 * API endpoint for leads SMS
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
export const LEAD_SMS: string = '/v1/client-sms/'

/**
 * API endpoint for leads notes
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
export const LEAD_NOTES: string = '/v1/notes/'

/**
 * API endpoint for lead contacts
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
export const LEAD_CONTACTS: string = '/v1/client-contact/'

/**
 * API endpoint for Lead Email
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
export const LEAD_EMAILS: string = '/v1/client-email/'

/**
 * API endpoint for Lead Addresses
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
export const LEAD_ADDRESSES: string = '/v1/client-address/'
