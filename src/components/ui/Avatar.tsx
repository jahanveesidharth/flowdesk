import { cn, getInitials, generateAvatarColor } from '../../lib/utils';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageUrl?: string;
}

export function Avatar({ name, size = 'md', className, imageUrl }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };
  const color = generateAvatarColor(name);
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sizeClasses[size], className)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}

export function AvatarGroup({ names, max = 3, size = 'sm' }: { names: string[]; max?: number; size?: AvatarProps['size'] }) {
  const visible = names.slice(0, max);
  const rest = names.length - max;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((name, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar name={name} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div className="ring-2 ring-white rounded-full w-7 h-7 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          +{rest}
        </div>
      )}
    </div>
  );
}
