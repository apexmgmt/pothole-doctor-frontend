/**
 * API endpoints for contract templates.
 * @method GET (data table response)
 * @method POST (create new contract template)
 * @method GET (details of a single contract template)
 * @method PUT (update a contract template)
 * @method DELETE (delete a contract template)
 */
export const CONTRACT_TEMPLATES: string = '/v1/tenant/contract-templates/'

/**
 * Get all contract templates without pagination
 * @method GET
 */
export const CONTRACT_TEMPLATES_ALL: string = '/v1/tenant/get-contract-templates'
