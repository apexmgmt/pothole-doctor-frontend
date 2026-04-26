import React from 'react'

/**
 * FillterIcon SVG component.
 * @returns {JSX.Element} The Fillter icon.
 */
const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M4.6665 13.6667V12' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M11.3335 13.6663V10.333' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M11.3335 3.99967V2.33301' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M4.6665 5.66634V2.33301' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path
      d='M12.6668 4H10.0002C9.63196 4 9.3335 4.29848 9.3335 4.66667V7.33333C9.3335 7.70153 9.63196 8 10.0002 8H12.6668C13.035 8 13.3335 7.70153 13.3335 7.33333V4.66667C13.3335 4.29848 13.035 4 12.6668 4Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinejoin='round'
    />
    <path
      d='M5.99984 8H3.33317C2.96498 8 2.6665 8.29847 2.6665 8.66667V11.3333C2.6665 11.7015 2.96498 12 3.33317 12H5.99984C6.36802 12 6.6665 11.7015 6.6665 11.3333V8.66667C6.6665 8.29847 6.36802 8 5.99984 8Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinejoin='round'
    />
  </svg>
)

export default FilterIcon
