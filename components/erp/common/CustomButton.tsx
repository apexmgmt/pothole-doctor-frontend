import React, { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode // Make children optional
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  size?: Size
  icon?: ReactNode | React.FC | any
  iconPosition?: IconPosition
  fullWidth?: boolean
  className?: string
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-2 text-[12px] gap-2',
    md: 'px-4 py-2.5 text-[14px] gap-2',
    lg: 'px-6 py-3 text-[16px] gap-3'
  }

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-light text-dark hover:opacity-90 active:opacity-80 border border-light',
    secondary:
      'bg-bg-2 text-light border border-border hover:bg-light hover:text-dark active:bg-light active:text-dark',
    outline: 'bg-transparent text-light border border-border hover:bg-bg-2/20 active:bg-bg-2/40',
    ghost: 'bg-transparent text-light hover:bg-bg-2/20 active:bg-bg-2/40'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const iconElement = icon && (
    <span className='flex-shrink-0'>
      {React.isValidElement(icon) ? icon : typeof icon === 'function' ? React.createElement(icon) : null}
    </span>
  )

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </button>
  )
}

export default CustomButton
