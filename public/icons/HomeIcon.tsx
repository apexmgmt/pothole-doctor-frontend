import React from 'react'

/**
 * HomeIcon SVG component.
 * @returns {JSX.Element} The Home icon.
 */
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M6.66675 12H9.33341' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path
      d='M13.2091 13.5856L14.5047 6.84903C14.6039 6.33276 14.3906 5.80637 13.9599 5.50489L8.76574 1.86895C8.30667 1.54761 7.69567 1.54759 7.23661 1.86889L2.04151 5.50485C1.61073 5.80633 1.39737 6.33284 1.49673 6.84917L2.79305 13.5857C2.91385 14.2134 3.46313 14.6671 4.10237 14.6671H11.8998C12.5391 14.6671 13.0884 14.2134 13.2091 13.5856Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinejoin='round'
    />
  </svg>
)

export default HomeIcon
