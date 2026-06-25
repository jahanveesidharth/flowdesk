import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover, onClick, padding = 'md' }: CardProps) {
  const padMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-950 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm',
        hover && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer',
        padMap[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-gray-900 dark:text-gray-100', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
