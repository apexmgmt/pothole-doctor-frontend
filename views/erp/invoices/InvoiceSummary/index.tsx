import { InvoiceSummary as Summary } from '@/types'
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

const InvoiceSummary = ({ invoiceSummary }: { invoiceSummary: Summary }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4'>
      {/* Card 1: Material & Labor Sales */}
      <Card className='border-l-4 border-l-primary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-primary'>
              Sales Breakdown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total Material Sale' value={formatCurrency(invoiceSummary.total_material_sale ?? 0)} />
          <StatItem label='Total Labor Sale' value={formatCurrency(invoiceSummary.total_labor_sale ?? 0)} />
        </CardContent>
      </Card>

      {/* Card 2: Total Sale, Discount & Tax */}
      <Card className='border-l-4 border-l-secondary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-secondary'>
              Revenue
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total Sale' value={formatCurrency(invoiceSummary.total_sale ?? 0)} />
          <StatItem label='Total Discount' value={formatCurrency(invoiceSummary.total_discount ?? 0)} />
          <StatItem label='Total Tax' value={formatCurrency(invoiceSummary.total_tax ?? 0)} />
        </CardContent>
      </Card>

      {/* Card 3: Work Order Costs & Profit */}
      <Card className='border-l-4 border-l-primary!'>
        <CardHeader className='pb-2 pt-3 px-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Badge variant='outline' className='bg-primary'>
              Work Order
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3'>
          <StatItem label='Total WO Cost' value={formatCurrency(invoiceSummary.total_work_order_cost ?? 0)} />
          <StatItem label='Total WO Profit' value={formatCurrency(invoiceSummary.total_work_order_profit ?? 0)} />
          <StatItem
            label='Total WO Net Profit'
            value={formatCurrency(invoiceSummary.total_work_order_net_profit ?? 0)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoiceSummary
