import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 border border-transparent shadow-xs dark:bg-teal-600 dark:hover:bg-teal-500',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 border border-transparent dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  outline:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-lg gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
