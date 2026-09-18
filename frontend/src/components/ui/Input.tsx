import React, { forwardRef, useState } from 'react';
import './Input.css';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      type = 'text',
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText) && !error;

    const classes = [
      'input-wrapper',
      hasError ? 'input-wrapper--error' : '',
      isFocused ? 'input-wrapper--focused' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes}>
        {/* Label */}
        {label && (
          <label htmlFor={id} className="input__label">
            {label}
          </label>
        )}

        {/* Input container */}
        <div
          className={[
            'input__container',
            leftIcon ? 'input__container--has-left-icon' : '',
            rightIcon && !showPasswordToggle
              ? 'input__container--has-right-icon'
              : '',
            showPasswordToggle
              ? 'input__container--has-password-toggle'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* Left icon */}
          {leftIcon && (
            <span
              className="input__icon input__icon--left"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className="input"
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${id}-error`
                : helperText
                  ? `${id}-helper`
                  : undefined
            }
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            {...props}
          />

          {/* Password visibility toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              className="input__toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
              tabIndex={-1}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                  <path d="M9.88 4.24A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M6.61 6.61C3.97 8.36 1 12 1 12s4 8 11 8a10.5 10.5 0 0 0 5.39-1.61" />
                </svg>
              ) : (
                /* Eye icon */
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}

          {/* Right icon */}
          {rightIcon && !showPasswordToggle && (
            <span
              className="input__icon input__icon--right"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <span
            id={id ? `${id}-error` : undefined}
            className="input__error"
            role="alert"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            {error}
          </span>
        )}

        {/* Helper text */}
        {hasHelper && (
          <span
            id={id ? `${id}-helper` : undefined}
            className="input__helper"
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';