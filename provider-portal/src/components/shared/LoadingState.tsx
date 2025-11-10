import React from 'react';

/**
 * LoadingState Component
 * Displays a skeleton loading state while data is being fetched
 */

interface LoadingStateProps {
  /**
   * Number of skeleton items to display
   * @default 3
   */
  count?: number;
  /**
   * Height of each skeleton item in pixels
   * @default 60
   */
  height?: number;
  /**
   * Custom message to display
   */
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  count = 3,
  height = 60,
  message = 'Loading...',
}) => {
  return (
    <div className="space-y-4 p-4">
      {message && (
        <p className="text-sm text-gray-600 mb-4">{message}</p>
      )}
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 rounded"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Displays a skeleton card for list items
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

/**
 * SkeletonTable Component
 * Displays skeleton rows for table loading state
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="animate-pulse bg-gray-200 rounded flex-1 h-10"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
