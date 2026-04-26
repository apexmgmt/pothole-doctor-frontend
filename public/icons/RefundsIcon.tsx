import React from 'react'

/**
 * RefundsIcon SVG component.
 * @returns {JSX.Element} The Refunds icon.
 */
const RefundsIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path d='M9.5 4.5L8.5 3.5L7.5 4.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M8.5 3.5V7.5C8.5 8.32843 7.82843 9 7 9H5C4.17157 9 3.5 8.32843 3.5 7.5V5C3.5 4.17157 4.17157 3.5 5 3.5H8.5Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M2.5 7.5L3.5 8.5L4.5 7.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M3.5 8.5V4.5C3.5 3.67157 4.17157 3 5 3H7C7.82843 3 8.5 3.67157 8.5 4.5V7C8.5 7.82843 7.82843 8.5 7 8.5H3.5Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  </svg>
)

export default RefundsIcon
