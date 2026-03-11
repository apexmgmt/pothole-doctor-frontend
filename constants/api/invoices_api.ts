/**
 * This contains all the API endpoints related to invoices.
 *
 * @method GET - Data table operation method: GET
 * @method POST - Data create method: POST (Only create the initial part of the invoice not the services)
 * @method PUT - Data update method: PUT /{id} (Only update the initial part of the invoice not the services)
 * @method GET - Data retrieve method: GET /{id}
 * @method DELETE - Data delete method: DELETE /{id}
 */
export const INVOICES: string = '/v1/tenant/invoices/'

/**
 * This contains all the API endpoints related to invoice services.
 * @param invoiceId string (uuid)
 * @method POST - To add a service to an invoice
 * @method PUT - To update a service in an invoice
 * @returns
 */
export const INVOICES_SERVICES = (invoiceId: string): string => {
  return `/v1/tenant/invoices/${invoiceId}/services/`
}

/**
 * This contains the API endpoint to restore a deleted invoice.
 * @param invoiceId string (uuid)
 * @method PUT - To restore a deleted invoice
 * @returns
 */
export const INVOICES_RESTORE = (invoiceId: string): string => {
  return `/v1/tenant/invoices/${invoiceId}/restore/`
}

/**
 * This contains the API endpoint to mark an invoice as signed.
 * @param invoiceId string (uuid)
 * @method POST - To mark an invoice as signed
 * @returns
 */
export const INVOICES_MARKED_SIGNED = (invoiceId: string): string => {
  return `/v1/tenant/invoices/${invoiceId}/mark-signed/`
}

/**
 * This contains the API endpoint to get all invoice documents for a specific invoice.
 * @param invoiceId string (uuid)
 * @method GET - To get data table of invoice documents for a specific invoice
 * @method POST - To upload a new invoice document for a specific invoice
 * @method GET - To get a specific invoice document for a specific invoice (document_id should be passed as query param)
 * @method PUT - To update a specific invoice document for a specific invoice (document_id should be passed as query param)
 * @method DELETE - To delete a specific invoice document for a specific invoice (document_id should be passed as query param)
 * @returns
 */
export const INVOICES_DOCUMENTS: string = '/v1/tenant/invoice-documents'

/**
 * This contains the API endpoint to get all invoice documents.
 * @method GET - To get data table of invoice documents
 * @method POST - To upload a new invoice document
 * @method GET - To get a specific invoice document (document_id should be passed as query param)
 * @method PUT - To update a specific invoice document (document_id should be passed as query param)
 * @method DELETE - To delete a specific invoice document (document_id should be passed as query param)
 * @returns
 */
export const INVOICE_DOCUMENTS: string = '/v1/tenant/invoice-documents/'

/**
 * This contains the API endpoint to view an invoice.
 * @param inid string (invoice hash id)
 * @param icid string (client hash id)
 */
export const VIEW_INVOICE = (inid: string, icid: string): string => {
  return `/v1/tenant/view-invoice/?inid=${inid}&icid=${icid}`
}

/**
 * This contains the API endpoint to approve an invoice.
 * @method POST - To approve an invoice
 * @param invoice_id string (uuid)
 */
export const APPROVE_INVOICE: string = '/v1/tenant/approve-invoice/'

/**
 * Get invoice tasks api endpoint (tenant)
 * @method GET, POST, PUT, SHOW, DELETE
 * @param invoice_id string
 * @returns string /v1/tenant/invoices/:invoice_id/tasks
 */
export const INVOICE_TASKS = (invoice_id: string): string => {
  return `/v1/tenant/invoices/${invoice_id}/tasks/`
}

/**
 * Get invoice notes api endpoint (tenant)
 * @method GET, POST, PUT, SHOW, DELETE
 * @param invoice_id string
 * @returns string /v1/tenant/invoices/:invoice_id/notes
 */
export const INVOICE_NOTES = (invoice_id: string): string => {
  return `/v1/tenant/invoices/${invoice_id}/notes/`
}

/**
 * This contains the API endpoint to get all invoice job images for a specific invoice.
 * @param invoiceId string (uuid)
 * @method GET - To get data table of invoice job images for a specific invoice
 * @method POST - To upload a new invoice job image for a specific invoice
 * @method DELETE - To delete a specific invoice job image for a specific invoice (image_id should be passed as query param)
 * @returns
 */
export const INVOICE_JOB_IMAGES: string = '/v1/tenant/invoice-job-images/'
