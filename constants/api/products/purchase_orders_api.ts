/**
 * Purchase Orders API Endpoints
 *
 * Data table operation method: GET
 * Data create method: POST
 * Data update method: PUT /{id}
 * Data retrieve method: GET /{id}
 * Data delete method: DELETE /{id}
 */
export const PURCHASE_ORDERS: string = '/v1/tenant/purchase-orders/'

/**
 * Create a shipment for a purchase order
 * @method POST
 * @param purchaseOrderId string
 * @returns string - /v1/tenant/purchase-orders/{purchaseOrderId}/shipment/
 */
export const PURCHASE_ORDERS_SHIPMENT = (purchaseOrderId: string): string => {
  return `/v1/tenant/purchase-orders/${purchaseOrderId}/shipment/`
}

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
export const PURCHASE_ORDERS_DOCUMENTS: string = '/v1/tenant/purchase-order-documents/'
