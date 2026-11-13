import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
  optionalMark?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  requiredMark,
  optionalMark,
  leftIcon,
  id,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || React.useId();
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
            {requiredMark && (
              <span className="text-rose-600 dark:text-rose-400 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optionalMark && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
          )}
        </div>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`block w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            leftIcon ? 'pl-9' : ''
          } ${isPassword ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500 focus-visible:border-rose-500 dark:border-rose-500'
              : 'border-slate-200 focus-visible:border-teal-600 dark:border-slate-700 dark:focus-visible:border-teal-500'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  requiredMark?: boolean;
  optionalMark?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  requiredMark,
  optionalMark,
  id,
  children,
  className = '',
  ...props
}) => {
  const selectId = id || React.useId();

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
            {requiredMark && (
              <span className="text-rose-600 dark:text-rose-400 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optionalMark && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
          )}
        </div>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={`block w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:bg-slate-900 dark:text-slate-100 ${
          error
            ? 'border-rose-500 focus-visible:border-rose-500 dark:border-rose-500'
            : 'border-slate-200 focus-visible:border-teal-600 dark:border-slate-700 dark:focus-visible:border-teal-500'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  optionalMark?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  optionalMark,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || React.useId();

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
          {optionalMark && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
          )}
        </div>
      )}
      <textarea
        id={textareaId}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? 'border-rose-500'
            : 'border-slate-200 focus-visible:border-teal-600 dark:border-slate-700 dark:focus-visible:border-teal-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};
