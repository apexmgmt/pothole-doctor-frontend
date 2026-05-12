/**
 * API endpoints for salesman chart reports
 * @method GET
 * @params starting_date (optional) format yyyy-mm-dd
 * @params end_date (optional) format yyyy-mm-dd
 * @params location_ids | array (optional) filter by location
 * 
 * By default the starting date and the end date will be one month from today
 */
export const SALESMAN_CHART_REPORT: string = '/v1/tenant/reports/salesman-chart'

/**
 * API endpoint for salesman ranking reports
 * @method GET
 * @params starting_date (optional) format yyyy-mm-dd
 * @params end_date (optional) format yyyy-mm-dd
 * @params location_ids | array (optional) filter by location
 * 
 * By default the starting date and the end date will be one month from today
 */
export const SALESMAN_RANKING_REPORT: string = '/v1/tenant/reports/salesman-ranking'
