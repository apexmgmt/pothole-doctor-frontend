import { EstimateType, Model } from '.'

export interface ContractTemplate extends Model {
  contract_name: string
  contract_type_id: string
  contract_type: EstimateType
  is_quote_contract: boolean
  is_default_quote_contract: boolean
  is_invoice_contract: boolean
  is_default_invoice_contract: boolean
  order: number
  template_message: string
}

export interface ContractTemplatePayload {
  contract_name: string
  contract_type_id: string
  is_quote_contract?: boolean
  is_default_quote_contract?: boolean
  is_invoice_contract?: boolean
  is_default_invoice_contract?: boolean
  order?: number
  template_message: string
}
