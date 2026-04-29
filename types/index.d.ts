/**
 * Base model interface that all other models will extend. It includes common fields like id, created_at, and updated_at.
 */
export interface Model {
  id: string
  created_at: string
  updated_at: string
}

export * from './react_node'
export * from './contact'
export * from './table'
export * from './role_permission'
export * from './location'
export * from './staff'
export * from './user'
export * from './business_location'
export * from './payment_terms'
export * from './partner_types'
export * from './units'
export * from './service_types'
export * from './contact_types'
export * from './note_types'
export * from './commissions/commissions'
export * from './tasks/task_types'
export * from './partners'
export * from './companies'
export * from './skills'
export * from './documents'
export * from './labor_costs'
export * from './menu'
export * from './warehouses'
export * from './products/product_categories'
export * from './tasks/task_reminders'
export * from './email_templates'
export * from './vendors'
export * from './tax_types'
export * from './products/products'
export * from './auth'
export * from './interest_levels'
export * from './installation_requests'
export * from './clients/client_sources'
export * from './clients/clients'
export * from './commissions/commission_types'
export * from './tasks/tasks'
export * from './estimates/estimate_types'
export * from './estimates/estimates'
export * from './estimates/proposals'
export * from './estimates/estimate_notes'
export * from './invoices'
export * from './work_orders'
export * from './completion_certificates'
export * from './couriers'
export * from './products/purchase_orders'

export * from './products/material_jobs';
