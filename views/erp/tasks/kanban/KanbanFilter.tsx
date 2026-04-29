import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/datePicker'

interface KanbanFilterProps {
  onChange: (filters: { starting_date?: string; ending_date?: string }) => void
  initialFilters?: { starting_date?: string; ending_date?: string }
}

const KanbanFilter: React.FC<KanbanFilterProps> = ({ onChange, initialFilters }) => {
  const [startingDate, setStartingDate] = useState<Date | null>(
    initialFilters?.starting_date ? new Date(initialFilters.starting_date) : null
  )

  const [endingDate, setEndingDate] = useState<Date | null>(
    initialFilters?.ending_date ? new Date(initialFilters.ending_date) : null
  )

  const handleApply = () => {
    onChange({
      starting_date: startingDate ? startingDate.toISOString().slice(0, 10) : undefined,
      ending_date: endingDate ? endingDate.toISOString().slice(0, 10) : undefined
    })
  }

  return (
    <div className='flex gap-2 items-end mb-4'>
      <div>
        <label className='block text-xs mb-1'>Start Date</label>
        <DatePicker value={startingDate} onChange={setStartingDate} placeholder='Start date' className='w-40' />
      </div>
      <div>
        <label className='block text-xs mb-1'>End Date</label>
        <DatePicker value={endingDate} onChange={setEndingDate} placeholder='End date' className='w-40' />
      </div>
      <Button type='button' onClick={handleApply} size='lg'>
        Apply
      </Button>
    </div>
  )
}

export default KanbanFilter
