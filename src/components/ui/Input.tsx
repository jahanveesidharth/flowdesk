import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <div className="relative">
          {iconLeft && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{iconLeft}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
              error ? 'border-red-400' : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700',
              iconLeft && 'pl-9',
              iconRight && 'pr-9',
              className,
            )}
            {...props}
          />
          {iconRight && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{iconRight}</div>}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            error ? 'border-red-400' : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700',
            className,
          )}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            error ? 'border-red-400' : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
