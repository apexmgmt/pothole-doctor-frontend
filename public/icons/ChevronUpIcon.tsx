import React from 'react'

/**
 * ChevronUpIcon SVG component.
 * @returns {JSX.Element} The Chevron Up icon.
 */
const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M12 10L8 6L4 10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

export default ChevronUpIcon
