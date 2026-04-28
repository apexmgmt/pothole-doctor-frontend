import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface KanbanFilterProps {
  onChange: (filters: { starting_date?: string; ending_date?: string }) => void
  initialFilters?: { starting_date?: string; ending_date?: string }
}

const KanbanFilter: React.FC<KanbanFilterProps> = ({ onChange, initialFilters }) => {
  const [startingDate, setStartingDate] = useState(initialFilters?.starting_date || '')
  const [endingDate, setEndingDate] = useState(initialFilters?.ending_date || '')

  const handleApply = () => {
    onChange({
      starting_date: startingDate || undefined,
      ending_date: endingDate || undefined
    })
  }

  return (
    <div className='flex gap-2 items-end mb-4'>
      <div>
        <label className='block text-xs mb-1'>Start Date</label>
        <Input type='date' value={startingDate} onChange={e => setStartingDate(e.target.value)} className='w-40' />
      </div>
      <div>
        <label className='block text-xs mb-1'>End Date</label>
        <Input type='date' value={endingDate} onChange={e => setEndingDate(e.target.value)} className='w-40' />
      </div>
      <Button type='button' onClick={handleApply} size='sm' className='h-8'>
        Apply
      </Button>
    </div>
  )
}

export default KanbanFilter
