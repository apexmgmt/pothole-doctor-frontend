import React from 'react'

/**
 * CalculatorIcon SVG component.
 * @returns {JSX.Element} The Calculator icon.
 */
const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M3 1H9C9.55228 1 10 1.44772 10 2V10C10 10.5523 9.55228 11 9 11H3C2.44772 11 2 10.5523 2 10V2C2 1.44772 2.44772 1 3 1Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M3 3H9' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M4 5H5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M7 5H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M4 6.5H5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M7 6.5H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M4 8H5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M7 8H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M4 9.5H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default CalculatorIcon
