import { Commission, Model } from ".."

export interface CommissionType extends Model{
  name: string
  slug: string
  commissions?: Commission[]
}

export interface CommissionTypePayload {
  name: string
}
