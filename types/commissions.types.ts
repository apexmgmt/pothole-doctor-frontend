export interface CommissionsParams {
  commissionTypes: CommissionType[] | []
  commissionFilters: CommissionFilter[] | []
  commissionBases: CommissionBase[] | []
}

export interface Commission {
  id: string
  commission_type: string
  based_on: string
  filter_type: string | 'greater-than' | 'less-than' | 'between' | 'same-as-store'
  per: string | 'Per Job'
  amount: number
  min_amount: number
  max_amount: number
  filter_percent: number | 0 | 1
  commission_percent: number | 0 | 1
  created_at: string
  updated_at: string
}

export interface CommissionPayload {
  commission_type: string
  based_on: string
  filter_type: string | 'greater-than' | 'less-than' | 'between' | 'same-as-store'
  per: string | 'Per Job'
  amount: number
  min_amount: number
  max_amount: number
  filter_percent: number | 0 | 1
  commission_percent: number | 0 | 1
}

export interface CommissionType {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface CommissionFilter {
  id: string
  type: string
  slug: string
  created_at: string
  updated_at: string
}

export interface CommissionBase {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface CreateOrEditCommissionModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  commissionTypes: CommissionType[]
  commissionFilters: CommissionFilter[]
  commissionBases: CommissionBase[]
  commissionId?: string
  commissionDetails?: Commission
}
