/**
 * API endpoints for proposals
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
export const PROPOSALS: string = '/v1/proposals/'
export const PROPOSALS_TENANT: string = '/v1/tenant/proposals/'
export const PROPOSALS_ALL: string = '/v1/get-proposals'
export const PROPOSALS_ALL_TENANT: string = '/v1/tenant/get-proposals/'

/**
 * Send proposal email api endpoint (tenant)
 * @method POST
 * @description: Body can have subject and message for custom subject and message, if not provided default subject and message will be used
 * @param proposal_id
 * @returns string api url
 */
export const SEND_PROPOSAL_EMAIL = (proposal_id: string): string => {
  return `/v1/tenant/proposals/${proposal_id}/email`
}

/**
 * View proposal api endpoint (tenant)
 * @method GET
 * @param proposal_hash_id - The hash ID of the proposal
 * @param client_hash_id - The hash ID of the client
 * @param iscus - Optional flag to indicate if the proposal is for a specific client
 * @returns string api url
 */
export const VIEW_PROPOSAL = (proposal_hash_id: string, client_hash_id: string, iscus?: 1 | 0): string => {
  return `/v1/tenant/view-proposal/?pid=${proposal_hash_id}&qcid=${client_hash_id}${iscus ? '&iscus=1' : ''}`
}

/**
 * Review proposal api endpoint (tenant)
 * @method POST
 * @param body - {pid, qcid, review}
 */
export const REVIEW_PROPOSAL: string = '/v1/tenant/review-proposal/'

/**
 * Approve proposal api endpoint (tenant)
 * @method POST
 * @param body - {pid, qcid}
 */
export const APPROVE_PROPOSAL: string = '/v1/tenant/approve-proposal/'

/**
 * Get proposal history api endpoint (tenant)
 * @method GET
 * @param proposal_id - The ID of the proposal
 * @description As it is a GET requests, others payload can only be passed as query params
 * @returns string api url
 */
export const PROPOSAL_HISTORY = (proposal_id: string): string => {
  return `/v1/tenant/proposals/${proposal_id}/history/`
}
