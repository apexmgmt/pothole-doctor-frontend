import React from 'react'

/**
 * MeasurementsIcon SVG component.
 * @returns {JSX.Element} The Measurements icon.
 */
const MeasurementsIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7' clipPath='url(#clip0_307_11299)'>
      <path
        d='M10.4988 6.5C10.5 6.26495 10.5 6.01535 10.5 5.75C10.5 3.51083 10.5 2.39124 9.8044 1.69562C9.10875 1 7.98915 1 5.75 1C3.51083 1 2.39124 1 1.69562 1.69562C1 2.39124 1 3.51083 1 5.75C1 7.98915 1 9.10875 1.69562 9.8044C2.39124 10.5 3.51083 10.5 5.75 10.5C6.01535 10.5 6.26495 10.5 6.5 10.4988'
        stroke='currentColor'
        strokeLinecap='round'
      />
      <path
        d='M9.25 7.5L9.37895 7.8485C9.54805 8.3055 9.6326 8.534 9.7993 8.7007C9.966 8.8674 10.1945 8.95195 10.6515 9.12105L11 9.25L10.6515 9.37895C10.1945 9.54805 9.966 9.6326 9.7993 9.7993C9.6326 9.966 9.54805 10.1945 9.37895 10.6515L9.25 11L9.12105 10.6515C8.95195 10.1945 8.8674 9.966 8.7007 9.7993C8.534 9.6326 8.3055 9.54805 7.8485 9.37895L7.5 9.25L7.8485 9.12105C8.3055 8.95195 8.534 8.8674 8.7007 8.7007C8.8674 8.534 8.95195 8.3055 9.12105 7.8485L9.25 7.5Z'
        stroke='currentColor'
        strokeLinejoin='round'
      />
      <path d='M1 4.5H10.5' stroke='currentColor' strokeLinejoin='round' />
      <path d='M3.25 2.75H3.25898' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5.25 2.75H5.259' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
    <defs>
      <clipPath id='clip0_307_11299'>
        <rect width='12' height='12' fill='white' />
      </clipPath>
    </defs>
  </svg>
)

export default MeasurementsIcon
