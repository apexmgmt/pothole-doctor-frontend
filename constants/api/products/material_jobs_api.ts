/**
 * Material Jobs API endpoints
 * @method GET - for data table api endpoint
 * @method GET - /materialJobId - for showing details of a material job
 */
export const MATERIAL_JOBS: string = '/v1/tenant/material-jobs/'

/**
 * Material jobs actions api endpoint
 * @method - GET - for data table api endpoint
 * @method - POST - for action creation
 * @method - DELETE - for action deletion (latest first)
 */
export const MATERIAL_JOBS_ACTIONS = (materialJobId: string): string => `/v1/tenant/material-jobs/${materialJobId}/actions`
