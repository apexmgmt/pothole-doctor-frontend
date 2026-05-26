import { InvoiceSummary as Summary } from '@/types'
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

const InvoiceSummary = ({ invoiceSummary }: { invoiceSummary: Summary }) => {
  return (
    <div className='flex flex-wrap justify-end gap-3 mb-4'>
      {/* Card 1: Material & Labor Sales */}
      <SummaryCard title='Sales Breakdown'>
        <StatItem label='Total Material Sale' value={formatCurrency(invoiceSummary.total_material_sale ?? 0)} />
        <StatItem label='Total Labor Sale' value={formatCurrency(invoiceSummary.total_labor_sale ?? 0)} />
      </SummaryCard>

      {/* Card 2: Total Sale, Discount & Tax */}
      <SummaryCard title='Revenue'>
        <StatItem label='Total Sale' value={formatCurrency(invoiceSummary.total_sale ?? 0)} />
        <StatItem label='Total Discount' value={formatCurrency(invoiceSummary.total_discount ?? 0)} />
        <StatItem label='Total Tax' value={formatCurrency(invoiceSummary.total_tax ?? 0)} />
      </SummaryCard>

      {/* Card 3: Work Order Costs & Profit */}
      <SummaryCard title='Work Order'>
        <StatItem label='Total WO Cost' value={formatCurrency(invoiceSummary.total_work_order_cost ?? 0)} />
        <StatItem label='Total WO Profit' value={formatCurrency(invoiceSummary.total_work_order_profit ?? 0)} />
        <StatItem label='Total WO Net Profit' value={formatCurrency(invoiceSummary.total_work_order_net_profit ?? 0)} />
      </SummaryCard>
    </div>
  )
}

export default InvoiceSummary
