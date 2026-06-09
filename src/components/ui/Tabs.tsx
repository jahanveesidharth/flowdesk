import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline' | 'boxed';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex gap-1 p-1 bg-gray-150/60 dark:bg-gray-900/60 rounded-xl border border-gray-200/40 dark:border-gray-800/40', className)}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center',
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm border border-gray-200/10' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold',
                activeTab === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-gray-200 text-gray-650 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'boxed') {
    return (
      <div className={cn('flex gap-0 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm', className)}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all flex-1 justify-center',
              i > 0 && 'border-l border-gray-200 dark:border-gray-800',
              activeTab === tab.id 
                ? 'bg-brand-500 text-white font-bold' 
                : 'bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && <span className={cn('text-xs rounded-full px-1.5 font-bold', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{tab.count}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-6 border-b border-gray-200 dark:border-gray-800', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 pb-3.5 text-sm font-semibold border-b-2 transition-all -mb-px',
            activeTab === tab.id
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-250 hover:border-gray-300 dark:hover:border-gray-700',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('text-xs rounded-full px-1.5 py-0.5 font-bold', activeTab === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400')}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
