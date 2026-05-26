import { WorkOrderSummary as Summary } from '@/types'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currency'

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className='flex justify-between items-center py-[4px] gap-4 border-b border-[#3b3637] last:border-0 last:pb-0'>
    <span className='text-[12px] text-[#a7a7ae] whitespace-nowrap'>{label}</span>
    <span className='text-[12px] text-white font-medium'>{value}</span>
  </div>
)

const SummaryCard = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => (
  <Card className='bg-[#171717] border border-[#3b3637] rounded-xl shadow-none overflow-hidden flex flex-col p-4 w-full sm:w-auto min-w-[240px]'>
    <div className='mb-[8px]'>
      <span className='text-[13px] font-medium text-white'>{title}</span>
    </div>
    <div className='flex-1 flex flex-col'>
      {children}
    </div>
  </Card>
)

const WorkOrderSummary = ({ workOrderSummary }: { workOrderSummary: Summary }) => {
  return (
    <div className='flex flex-wrap justify-end gap-3 mb-4'>
      {/* Card 1: Sales */}
      <SummaryCard title='Sales'>
        <StatItem label='Sales' value={formatCurrency(workOrderSummary.total_invoice_total ?? 0)} />
        <StatItem label='Total Tax' value={formatCurrency(workOrderSummary.total_invoice_total_tax ?? 0)} />
      </SummaryCard>

      {/* Card 2: Costs */}
      <SummaryCard title='Costs'>
        <StatItem label='Total Costs' value={formatCurrency(workOrderSummary.total_cost ?? 0)} />
        <StatItem label='Material' value={formatCurrency(workOrderSummary.total_material_cost ?? 0)} />
        <StatItem label='Labor Cost' value={formatCurrency(workOrderSummary.total_labor_cost ?? 0)} />
      </SummaryCard>

      {/* Card 3: Expenses */}
      <SummaryCard title='Expenses'>
        <StatItem label='Total Expenses' value={formatCurrency(workOrderSummary.total_expenses ?? 0)} />
        <StatItem label='Freight Charge' value={formatCurrency(workOrderSummary.total_freight_charge ?? 0)} />
      </SummaryCard>

      {/* Card 4: Profit */}
      <SummaryCard title='Profit'>
        <StatItem
          label={`Total Profit (${workOrderSummary?.total_profit_percentage?.toFixed(2) ?? '0.00'}%)`}
          value={formatCurrency(workOrderSummary.total_profit ?? 0)}
        />
        <StatItem label='Commission' value={formatCurrency(workOrderSummary.total_commissions ?? 0)} />
        <StatItem label='Net Profit' value={formatCurrency(workOrderSummary.total_net_profit ?? 0)} />
      </SummaryCard>
    </div>
  )
}

export default WorkOrderSummary

