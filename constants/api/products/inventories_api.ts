/**
 * API endpoint for Inventories
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
export const INVENTORIES: string = '/v1/tenant/inventories/'

/**
 * Adjust inventory API
 * @param inventoryId Inventory ID
 * @returns API endpoint for adjusting inventory
 */
export const INVENTORY_ADJUST = (inventoryId: string): string => `/v1/tenant/inventories/${inventoryId}/adjust/`

/**
 * API endpoint for Inventory adjustment 
 * @method: GET - Data table list
 * @method: GET (/id) - Data retrieve
 * @method: POST (/purchaseOrderId) - Create inventory adjustment for a inventory purchase order
 */
export const INVENTORY_ADJUSTMENTS: string = '/v1/tenant/inventory-adjustments/'
