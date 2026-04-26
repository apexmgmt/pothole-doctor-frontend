import React from 'react'

/**
 * PlusIcon SVG component.
 * @returns {JSX.Element} The Plus icon.
 */
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M7.99984 3.33301V12.6663'
      stroke='#09090B'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M3.3335 8.00033H12.6668' stroke='#09090B' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

export default PlusIcon
