/**
 * Base API URL for backend requests.
 * Uses NEXT_PUBLIC_API_URL from environment variables, or defaults to localhost.
 */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export * from './auth_api'
export * from './organizations_api'
export * from './permission_api'
export * from './role_api'
export * from './locations_api'
export * from './staff_api'
export * from './business_locations_api'
export * from './payment_terms_api'
export * from './partner_types_api'
export * from './units_api'
export * from './service_types_api'
export * from './contact_types_api'
export * from './note_types_api'
export * from './commissions_api'
export * from './task_types_api'
export * from './partners_api'
export * from './companies_api'
export * from './skills_api'
export * from './labor_costs_api'
export * from './warehouses_api'
export * from './product_categories_api'
export * from './task_reminders_api'
export * from './email_templates_api'
