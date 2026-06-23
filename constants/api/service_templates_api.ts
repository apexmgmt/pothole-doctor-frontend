/**
 * API endpoint for service templates
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
export const SERVICE_TEMPLATES: string = '/v1/tenant/service-templates/'
export const SERVICE_TEMPLATES_RESTORE = (serviceTemplateId: string): string =>
  SERVICE_TEMPLATES + serviceTemplateId + '/restore'

/**
 * API endpoint for getting all service templates
 *
 * Method: GET
 */
export const SERVICE_TEMPLATES_ALL: string = '/v1/tenant/get-service-templates'
