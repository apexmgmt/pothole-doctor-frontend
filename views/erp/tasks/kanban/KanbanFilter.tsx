'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/datePicker'
import { X } from 'lucide-react' // Using an icon for the clear action

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

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const handleApply = () => {
    onChange({
      starting_date: startingDate ? formatDate(startingDate) : undefined,
      ending_date: endingDate ? formatDate(endingDate) : undefined
    })
  }

  const handleClear = () => {
    setStartingDate(null)
    setEndingDate(null)

    // Pass empty values to trigger the "fetch everything" logic in the board
    onChange({
      starting_date: undefined,
      ending_date: undefined
    })
  }

  return (
    <div className='flex gap-2 items-end mb-4'>
      <div>
        <label className='block text-xs mb-1 font-medium'>Start Date</label>
        <DatePicker value={startingDate} onChange={setStartingDate} placeholder='Start date' className='w-40' />
      </div>
      <div>
        <label className='block text-xs mb-1 font-medium'>End Date</label>
        <DatePicker value={endingDate} onChange={setEndingDate} placeholder='End date' className='w-40' />
      </div>

      <div className='flex gap-2'>
        <Button type='button' onClick={handleApply} size='default'>
          Apply
        </Button>

        {(startingDate || endingDate) && (
          <Button type='button' variant='outline' onClick={handleClear} size='default'>
            <X className='h-4 w-4 mr-1' /> Clear
          </Button>
        )}
      </div>
    </div>
  )
}

export default KanbanFilter
