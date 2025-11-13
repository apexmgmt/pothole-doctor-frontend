import React from 'react'

/**
 * DollarIcon SVG component.
 * @returns {JSX.Element} The Dollar icon.
 */
const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path d='M6 1V11' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M8.5 3.5H5.5C4.67157 3.5 4 4.17157 4 5C4 5.82843 4.67157 6.5 5.5 6.5H6.5C7.32843 6.5 8 7.17157 8 8C8 8.82843 7.32843 9.5 6.5 9.5H3.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  </svg>
)

export default DollarIcon
