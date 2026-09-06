import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '16px',
  radius = 'var(--radius-md)',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radius,
      }}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height={200} radius="12px" className="skeleton-card__image" />
      <div className="skeleton-card__content">
        <Skeleton width="60%" height={24} className="skeleton-card__title" />
        <div className="skeleton-card__lines">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              width={i === lines - 1 ? '80%' : '100%'}
              height={16}
              className="skeleton-card__line"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  columns?: number;
  count?: number;
  className?: string;
}

export function SkeletonGrid({
  columns = 3,
  count = 6,
  className = '',
}: SkeletonGridProps) {
  return (
    <div
      className={`skeleton-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={3} />
      ))}
    </div>
  );
}
