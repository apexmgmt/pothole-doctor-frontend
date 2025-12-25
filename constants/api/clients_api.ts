/**
 * Clients API endpoints
 *
 * @method: GET - Retrieve clients data table.
 *
 * @method: POST - Create a new client entry.
 *
 * @method: PUT - Update an existing client entry. /id
 *
 * @method: GET - Retrieve a specific client entry by ID. /id
 *
 * @method: DELETE - Remove a specific client entry by ID. /id
 *
 * @method: POST - Restore a deleted client entry by ID. /id/restore
 */
export const CLIENTS: string = '/v1/clients/'

/** ? type = customer | lead */
export const CLIENTS_ALL: string = '/v1/get-clients'

/**
 * API endpoint for Clients documents
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
export const CLIENT_DOCUMENTS: string = '/v1/client-documents/'

/**
 * API endpoint for clients SMS
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
export const CLIENT_SMS: string = '/v1/client-sms/'

/**
 * API endpoint for clients notes
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
export const CLIENT_NOTES: string = '/v1/notes/'

/**
 * API endpoint for client contacts
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
export const CLIENT_CONTACTS: string = '/v1/client-contact/'

/**
 * API endpoint for Client Email
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
export const CLIENT_EMAILS: string = '/v1/client-email/'

/**
 * API endpoint for Client Addresses
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
export const CLIENT_ADDRESSES: string = '/v1/client-address/'
