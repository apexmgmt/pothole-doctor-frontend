export const NOTIFICATIONS: string = '/v1/tenant/notifications/'
export const NOTIFICATION_MARK_AS_READ = (id: string): string => `/v1/tenant/notifications/${id}/mark-as-read`
export const NOTIFICATION_MARK_ALL_AS_READ: string = '/v1/tenant/notifications/mark-all-as-read'
