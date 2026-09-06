// components/ui/Button.tsx
import React from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = isLoading ? 'btn--loading' : '';
  const disabledClass = disabled || isLoading ? 'btn--disabled' : '';
  
  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    fullWidthClass,
    loadingClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn__loader">
          <svg className="btn__spinner" viewBox="0 0 24 24">
            <circle className="btn__spinner-circle" cx="12" cy="12" r="10" />
            <circle className="btn__spinner-path" cx="12" cy="12" r="10" />
          </svg>
        </span>
      )}
      
      {leftIcon && !isLoading && (
        <span className="btn__icon btn__icon--left">{leftIcon}</span>
      )}
      
      <span className="btn__content">{children}</span>
      
      {rightIcon && (
        <span className="btn__icon btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
};