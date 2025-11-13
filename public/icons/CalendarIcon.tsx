import React from 'react'

/**
 * CalendarIcon SVG component.
 * @returns {JSX.Element} The Calender icon.
 */
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path d='M12 1.5V4.5M6 1.5V4.5' stroke='#A7A7AE' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M9.75 3H8.25C5.42157 3 4.00736 3 3.12868 3.87868C2.25 4.75736 2.25 6.17157 2.25 9V10.5C2.25 13.3284 2.25 14.7427 3.12868 15.6213C4.00736 16.5 5.42157 16.5 8.25 16.5H9.75C12.5784 16.5 13.9927 16.5 14.8713 15.6213C15.75 14.7427 15.75 13.3284 15.75 10.5V9C15.75 6.17157 15.75 4.75736 14.8713 3.87868C13.9927 3 12.5784 3 9.75 3Z'
        stroke='#A7A7AE'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M2.25 7.5H15.75' stroke='#A7A7AE' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M8.99662 10.5H9.00337M8.99662 13.5H9.00337M11.9932 10.5H12M6 10.5H6.00673M6 13.5H6.00673'
        stroke='#A7A7AE'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  </svg>
)

export default CalendarIcon
