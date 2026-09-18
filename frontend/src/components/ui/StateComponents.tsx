import React from 'react';
import { AlertCircle, Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <Package size={48} />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-[var(--color-text-muted)] mb-4 opacity-60">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-base text-[var(--color-text-muted)] mb-6 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg">
      <AlertCircle size={48} className="text-[var(--color-error)] mb-4" />
      <h3 className="text-xl font-semibold text-[var(--color-error)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-base text-[var(--color-text-muted)] mb-6 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
