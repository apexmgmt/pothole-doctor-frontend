import React from 'react'

/**
 * JobsIcon SVG component.
 * @returns {JSX.Element} The Jobs icon.
 */
const JobsIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M9.5 4.5V3.5C9.5 2.11929 8.38071 1 7 1H5C3.61929 1 2.5 2.11929 2.5 3.5V4.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M1 4.5H11C11.2761 4.5 11.5 4.72386 11.5 5V9.5C11.5 10.3284 10.8284 11 10 11H2C1.17157 11 0.5 10.3284 0.5 9.5V5C0.5 4.72386 0.723858 4.5 1 4.5Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M4 7H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M4 8.5H6' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default JobsIcon
