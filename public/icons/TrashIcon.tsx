import React from 'react'

/**
 * TrashIcon SVG component.
 * @returns {JSX.Element} The Trash icon.
 */
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M2.5 3H9.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    <path
      d='M4.5 3V2C4.5 1.45 4.95 1 5.5 1H6.5C7.05 1 7.5 1.45 7.5 2V3'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3 3H9V9.5C9 10.05 8.55 10.5 8 10.5H4C3.45 10.5 3 10.05 3 9.5V3Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default TrashIcon
