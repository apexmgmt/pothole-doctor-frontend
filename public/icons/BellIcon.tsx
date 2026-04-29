import React from 'react'

/**
 * BellIcon SVG component.
 * @returns {JSX.Element} The Bell icon.
 */
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M11.3332 16.6667H8.6665' stroke='#F4F4F5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M14.1665 8.36033V8.33366V8.33366C14.1665 6.03283 12.3007 4.16699 9.99984 4.16699V4.16699C7.699 4.16699 5.83317 6.03283 5.83317 8.33366V8.33366V8.36033V10.4203C5.83317 10.6903 5.68067 10.9362 5.43984 11.057L5.02067 11.2662C4.49734 11.5287 4.1665 12.0637 4.1665 12.6487V12.6487C4.1665 13.502 4.85817 14.1937 5.7115 14.1937H14.2882C15.1415 14.1937 15.8332 13.502 15.8332 12.6487V12.6487C15.8332 12.0637 15.5023 11.5287 14.979 11.267L14.5598 11.0578C14.319 10.9362 14.1665 10.6903 14.1665 10.4203V8.36033Z'
      stroke='#F4F4F5'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default BellIcon
