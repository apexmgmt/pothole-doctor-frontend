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
export const CLIENTS_TENANT: string = '/v1/tenant/clients/'

/** ? type = customer | lead */
export const CLIENTS_ALL: string = '/v1/get-clients'
export const CLIENTS_ALL_TENANT: string = '/v1/tenant/get-clients/'

export const CLIENTS_EXPORT: string = '/v1/export-clients'
export const CLIENTS_EXPORT_TENANT: string = '/v1/tenant/export-clients'

/**
 * Update lead stage api endpoint
 * @method PUT
 * @param clientId 
 * @param stage 
 * @returns `/v1/tenant/clients/${clientId}/lead-stage/${stage}`
 */
export const CLIENTS_LEAD_STAGE = (
  clientId: string,
  stage: 'prospect' | 'open' | 'working' | 'meeting-set' | 'opportunity' | 'closed-won' | 'closed-lost'
) => `/v1/tenant/clients/${clientId}/lead-stage/${stage}`

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
export const CLIENT_DOCUMENTS_TENANT: string = '/v1/tenant/client-documents/'

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
export const CLIENT_SMS_TENANT: string = '/v1/tenant/client-sms/'

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
export const CLIENT_NOTES_TENANT: string = '/v1/tenant/notes/'

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
export const CLIENT_CONTACTS_TENANT: string = '/v1/tenant/client-contact/'

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
export const CLIENT_EMAILS_TENANT: string = '/v1/tenant/client-email/'

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
export const CLIENT_ADDRESSES_TENANT: string = '/v1/tenant/client-address/'
