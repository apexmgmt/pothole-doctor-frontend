import React from 'react'

/**
 * EmailIcon SVG component.
 * @returns {JSX.Element} The Email icon.
 */
const EmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M1 3C1 2.44772 1.44772 2 2 2H10C10.5523 2 11 2.44772 11 3V9C11 9.55228 10.5523 10 10 10H2C1.44772 10 1 9.55228 1 9V3Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M1 3L6 6.5L11 3' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default EmailIcon
