import { ReactNode, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Icon component to display */
  icon: ElementType;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Action icon (appears before label) */
  actionIcon?: ElementType;
  /** Additional class names */
  className?: string;
  /** Children for custom content */
  children?: ReactNode;
}

/**
 * Reusable empty state component for lists, searches, etc.
 * Provides consistent styling for "no data" scenarios.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 space-y-4', className)}>
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-xs mx-auto">{description}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}
