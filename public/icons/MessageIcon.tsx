import React from 'react'

/**
 * MessageIcon SVG component.
 * @returns {JSX.Element} The Message icon.
 */
const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      opacity='0.7'
      d='M3.5 4.25L4.97101 5.1197C5.8286 5.62675 6.1714 5.62675 7.029 5.1197L8.5 4.25'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      opacity='0.7'
      d='M1.00788 6.73781C1.04057 8.27056 1.05691 9.03696 1.62248 9.60466C2.18804 10.1724 2.97517 10.1922 4.54942 10.2317C5.51965 10.2561 6.48035 10.2561 7.4506 10.2317C9.02485 10.1922 9.81195 10.1724 10.3775 9.60466C10.9431 9.03696 10.9595 8.27056 10.9921 6.73781C11.0027 6.24496 11.0027 5.75501 10.9921 5.26221C10.9595 3.72943 10.9431 2.96305 10.3775 2.39533C9.81195 1.82762 9.02485 1.80784 7.4506 1.76829C6.48035 1.74391 5.51965 1.74391 4.54941 1.76828C2.97517 1.80783 2.18804 1.82761 1.62248 2.39533C1.05691 2.96304 1.04057 3.72942 1.00788 5.26216C0.997373 5.75501 0.997373 6.24496 1.00788 6.73781Z'
      stroke='currentColor'
      strokeLinejoin='round'
    />
  </svg>
)

export default MessageIcon
