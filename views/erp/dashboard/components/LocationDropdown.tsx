import React, { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

import type { LocationOption } from '../utils'

interface LocationDropdownProps {
  locations: LocationOption[]
  selected: string
  onChange: (id: string) => void
}

export default function LocationDropdown({ locations, selected, onChange }: LocationDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    if (open) document.addEventListener('mousedown', handleOutside)

    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const label = selected ? (locations.find(l => l.id === selected)?.name ?? 'All Locations') : 'All Locations'

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(o => !o)}
        className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground cursor-pointer'
      >
        <MapPin className='w-3 h-3' />
        {label}
        <span className='ml-0.5'>▾</span>
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-1 z-50 min-w-[180px] max-h-64 overflow-y-auto rounded border border-border/40 bg-card shadow-lg'>
          {/* "All Locations" option resets the filter */}
          <DropdownItem
            label='All Locations'
            active={!selected}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          />
          {locations.map(loc => (
            <DropdownItem
              key={loc.id}
              label={loc.name}
              active={selected === loc.id}
              onClick={() => {
                onChange(loc.id)
                setOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-border/20 ${
        active ? 'text-primary font-semibold' : 'text-card-foreground'
      }`}
    >
      <span
        className={`shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
          active ? 'border-primary bg-primary' : 'border-border/60 bg-transparent'
        }`}
      >
        {active && (
          <svg viewBox='0 0 10 8' fill='none' className='w-2.5 h-2.5'>
            <path d='M1 4l3 3 5-6' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}
