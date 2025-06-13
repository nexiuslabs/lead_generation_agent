import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  disabled,
  className = '',
  fullWidth = false,
  ...props
}, ref) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Disabled state
  const isDisabled = disabled || isLoading;
  
  // Variant classes
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 border border-transparent';
      break;
    case 'secondary':
      variantClasses = 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-500 border border-transparent';
      break;
    case 'outline':
      variantClasses = 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-secondary text-gray-700 dark:text-gray-300 focus:ring-primary-500 border border-gray-300 dark:border-dark-secondary';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-tertiary text-gray-700 dark:text-gray-300 focus:ring-gray-500 border border-transparent';
      break;
    case 'danger':
      variantClasses = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 border border-transparent';
      break;
  }
  
  // Size classes
  let sizeClasses = '';
  let iconSize = 16;
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-sm';
      iconSize = 14;
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base';
      iconSize = 20;
      break;
    case 'icon':
      sizeClasses = 'p-2';
      iconSize = 18;
      break;
    case 'md':
    default:
      sizeClasses = 'px-4 py-2 text-sm';
  }
  
  // Disabled classes
  const disabledClasses = isDisabled 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:shadow-sm';
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${widthClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && LeftIcon && <LeftIcon size={iconSize} className={children ? 'mr-2' : ''} />}
      {children}
      {!isLoading && RightIcon && <RightIcon size={iconSize} className={children ? 'ml-2' : ''} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;