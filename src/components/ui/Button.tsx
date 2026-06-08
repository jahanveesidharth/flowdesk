import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, iconLeft, iconRight, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
    const variants = {
      primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300',
      outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
      success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
    };
    const sizes = {
      xs: 'text-xs px-2.5 py-1.5 h-7',
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-9',
      lg: 'text-base px-5 py-2.5 h-11',
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';
