import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    neutral: 'bg-gray-50 text-gray-500 border border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800',
  };
  const sizeClasses = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1' };
  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    confirmed: { label: 'Confirmed', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    cancelled: { label: 'Cancelled', variant: 'error' },
    checked_in: { label: 'Checked In', variant: 'info' },
    no_show: { label: 'No Show', variant: 'neutral' },
    completed: { label: 'Completed', variant: 'neutral' },
    available: { label: 'Available', variant: 'success' },
    occupied: { label: 'Occupied', variant: 'error' },
    reserved: { label: 'Reserved', variant: 'warning' },
    maintenance: { label: 'Maintenance', variant: 'neutral' },
    blocked: { label: 'Blocked', variant: 'neutral' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'default' as const };
  return <Badge variant={variant}>{label}</Badge>;
}
