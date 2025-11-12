'use client'

import React, { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ButtonType {
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ReactNode | any
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
}

interface CommonLayoutProps {
  title: string
  noTabs?: boolean
  buttons?: ButtonType[]
  className?: string
  children?: ReactNode
}

/**
 * CommonLayout - A reusable component for section headers with dynamic title and buttons
 *
 * @param {Object} props
 * @param {string} props.title - The main title for the section
 * @param {Array} props.buttons - Array of button objects with label, icon, onClick, isActive, and disabled properties
 * @param {string} props.className - Additional CSS classes for the container
 * @param {React.ReactNode} props.children - Content to render below the header
 */
const CommonLayout: React.FC<CommonLayoutProps> = ({ title, noTabs = false, buttons = [], className = '', children }) => {
  return (
    <div className={`bg-bg-2 rounded-lg border border-border p-5 ${className}`}>
      {/* Header Section */}
      <div className={`border-b border-border ${noTabs ? '' : 'pb-4'}`}>
        {/* Title */}
        <h2 className='text-xl font-semibold text-light mb-4'>{title}</h2>

        {/* Switcher Buttons */}
        {!noTabs && buttons.length > 0 && (
          <div>
            <div className='inline-flex bg-border/40 border border-border rounded-lg p-1 gap-1'>
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  variant='ghost'
                  size='sm'
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    button.isActive
                      ? 'bg-light/20 text-light shadow-sm hover:bg-light/25'
                      : 'text-gray hover:text-light hover:bg-light/5'
                  } ${button.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {button.icon &&
                    (typeof button.icon === 'function'
                      ? React.createElement(button.icon, { className: 'w-4 h-4' })
                      : button.icon)}
                  <span className='text-sm font-medium'>{button.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className=''>{children}</div>
    </div>
  )
}

export default CommonLayout
