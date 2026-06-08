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
      <div className={cn('flex gap-1 p-1 bg-gray-100 rounded-xl', className)}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'
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
      <div className={cn('flex gap-0 border border-gray-200 rounded-lg overflow-hidden', className)}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all flex-1 justify-center',
              i > 0 && 'border-l border-gray-200',
              activeTab === tab.id ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && <span className={cn('text-xs rounded-full px-1.5', activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100')}>{tab.count}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-6 border-b border-gray-200', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-all -mb-px',
            activeTab === tab.id
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('text-xs rounded-full px-1.5 py-0.5', activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500')}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
