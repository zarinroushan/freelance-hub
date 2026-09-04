import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full py-2 border rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
              ${icon ? 'pl-10 pr-4' : 'px-4'}
              ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}
              ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-sm text-[var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';