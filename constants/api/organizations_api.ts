/**Organization API: GET, POST, PUT, GET, DELETE */
export const ORGANIZATIONS: string = '/v1/organizations/'

/** Organization Status Update API: POST */
export const ORGANIZATION_STATUS_CHANGE: string = '/v1/organization-status-change'

/**
 * Organization Password Change API: PUT
 * request = {password: required, confirmation_password: required}
 */
export const ORGANIZATION_PASSWORD_CHANGE: string = '/v1/organization-password-change/' // + organizationId
