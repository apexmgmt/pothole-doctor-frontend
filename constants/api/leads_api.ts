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
export const LEADS: string = '/v1/leads/';
export const LEADS_ALL: string = LEADS + '/v1/get-leads/';
