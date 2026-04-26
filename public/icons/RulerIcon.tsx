import React from 'react'

/**
 * RulerIcon SVG component.
 * @returns {JSX.Element} The Ruler icon.
 */
const RulerIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M1 2H11C11.5523 2 12 2.44772 12 3V9C12 9.55228 11.5523 10 11 10H1C0.447715 10 0 9.55228 0 9V3C0 2.44772 0.447715 2 1 2Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M2 4H3' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5 4H6' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M8 4H9' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M2 6H3' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5 6H6' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M8 6H9' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M2 8H3' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5 8H6' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M8 8H9' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default RulerIcon
