/**
 * This file contains API endpoint constants related to work orders.
 * @method GET - To get a list of work orders or a specific work order
 * @method POST - To create a new work order
 * @method PUT - To update an existing work order
 * @method DELETE - To delete a work order
 */
export const WORK_ORDERS: string = '/v1/tenant/work-orders/'

/**
 * This contains the API endpoint to manage services related to a specific work order.
 * @param workOrderId string (uuid)
 * @method POST - To add a service to a work order
 * @method PUT - To update a service in a work order
 * @returns
 */
export const WORK_ORDERS_SERVICES = (workOrderId: string): string => {
  return `/v1/tenant/work-orders/${workOrderId}/services/`
}

/**
 * This contains the API endpoint to restore a specific work order.
 * @param workOrderId string (uuid)
 * @method PUT - To restore a work order
 * @returns
 */
export const WORK_ORDERS_RESTORE = (workOrderId: string): string => {
  return `/v1/tenant/work-orders/${workOrderId}/restore/`
}

/**
 * This contains the API endpoint to get all work order documents.
 * @method GET - To get data table of work order documents
 * @method POST - To upload a new work order document
 * @method GET - To get a specific work order document (document_id should be passed as query param)
 * @method PUT - To update a specific work order document (document_id should be passed as query param)
 * @method DELETE - To delete a specific work order document (document_id should be passed as query param)
 * @returns
 */
export const WORK_ORDER_DOCUMENTS: string = '/v1/tenant/work-order-documents/'
