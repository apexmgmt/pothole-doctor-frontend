import { WorkOrderSummary as Summary } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/currency'

const StatItem = ({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) => (
  <div className='flex justify-between items-center py-1 border-b last:border-b-0'>
    <span className='text-xs text-muted-foreground'>{label}</span>
    <span className='font-semibold text-sm'>
      {value}
      {suffix && <span className='text-xs text-muted-foreground ml-1'>{suffix}</span>}
    </span>
  </div>
)

const WorkOrderSummary = ({ workOrderSummary }: { workOrderSummary: Summary }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4'>
      {/* Card 1: Sales & Tax */}
      <Card className='border-l-4 border-l-primary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-primary'>
              Sales
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total Sale' value={formatCurrency(workOrderSummary.total_invoice_total ?? 0)} />
          <StatItem label='Total Tax' value={formatCurrency(workOrderSummary.total_invoice_total_tax ?? 0)} />
        </CardContent>
      </Card>

      {/* Card 2: Costs */}
      <Card className='border-l-4 border-l-secondary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-secondary'>
              Costs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total Cost' value={formatCurrency(workOrderSummary.total_cost ?? 0)} />
          <StatItem label='Material Cost' value={formatCurrency(workOrderSummary.total_material_cost ?? 0)} />
          <StatItem label='Labor Cost' value={formatCurrency(workOrderSummary.total_labor_cost ?? 0)} />
        </CardContent>
      </Card>

      {/* Card 3: Expenses & Freight */}
      <Card className='border-l-4 border-l-secondary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-secondary'>
              Expenses
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total Expenses' value={formatCurrency(workOrderSummary.total_expenses ?? 0)} />
          <StatItem label='Freight Charge' value={formatCurrency(workOrderSummary.total_freight_charge ?? 0)} />
        </CardContent>
      </Card>

      {/* Card 4: Profit & Commissions */}
      <Card className='border-l-4 border-l-primary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-primary'>
              Profit
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem
            label='Total Profit'
            value={`(${workOrderSummary?.total_profit_percentage?.toFixed(2) ?? 0}%) ${formatCurrency(workOrderSummary.total_profit ?? 0)}`}
          />
          <StatItem label='Commission' value={formatCurrency(workOrderSummary.total_commissions ?? 0)} />
          <StatItem label='Net Profit' value={formatCurrency(workOrderSummary.total_net_profit ?? 0)} />
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkOrderSummary
