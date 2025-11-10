import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/**
 * Generic Skeleton component for loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return <div className={`${styles.skeleton} ${className || ''}`} style={style} />;
};

/**
 * Encounter Editor Page Skeleton
 */
export const EncounterEditorSkeleton: React.FC = () => (
  <div className={styles.container}>
    {/* Header */}
    <div className={styles.header}>
      <div>
        <Skeleton width="300px" height="32px" className={styles.marginBottom} />
        <Skeleton width="400px" height="16px" />
      </div>
      <div className={styles.headerActions}>
        <Skeleton width="100px" height="40px" borderRadius="6px" />
        <Skeleton width="100px" height="40px" borderRadius="6px" />
      </div>
    </div>

    {/* Tabs */}
    <div className={styles.tabs}>
      <Skeleton width="80px" height="40px" borderRadius="6px" />
      <Skeleton width="80px" height="40px" borderRadius="6px" />
      <Skeleton width="80px" height="40px" borderRadius="6px" />
      <Skeleton width="80px" height="40px" borderRadius="6px" />
    </div>

    {/* Content */}
    <div className={styles.content}>
      <Skeleton width="100%" height="24px" className={styles.marginBottom} />
      <Skeleton width="100%" height="100px" className={styles.marginBottom} />
      <Skeleton width="100%" height="100px" className={styles.marginBottom} />
      <Skeleton width="100%" height="100px" />
    </div>
  </div>
);

/**
 * Component Section Skeleton
 */
export const ComponentSectionSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className={styles.section}>
    <Skeleton width="200px" height="24px" className={styles.marginBottom} />
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.marginBottom}>
        <Skeleton width="100%" height="16px" className={styles.marginBottom} />
        <Skeleton width="100%" height="40px" />
      </div>
    ))}
  </div>
);

/**
 * List Item Skeleton
 */
export const ListItemSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className={styles.list}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.listItem}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className={styles.listItemContent}>
          <Skeleton width="200px" height="16px" className={styles.marginBottom} />
          <Skeleton width="300px" height="12px" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Table Skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className={styles.table}>
    {/* Header */}
    <div className={styles.tableRow}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width="100%" height="16px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className={styles.tableRow}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} width="100%" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Prescription Preview Skeleton
 */
export const PrescriptionSkeleton: React.FC = () => (
  <div className={styles.prescription}>
    <div className={styles.prescriptionHeader}>
      <Skeleton width="200px" height="32px" className={styles.marginBottom} />
      <Skeleton width="150px" height="16px" />
    </div>

    <div className={styles.prescriptionSection}>
      <Skeleton width="150px" height="20px" className={styles.marginBottom} />
      <Skeleton width="100%" height="60px" />
    </div>

    <div className={styles.prescriptionSection}>
      <Skeleton width="150px" height="20px" className={styles.marginBottom} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} width="100%" height="80px" className={styles.marginBottom} />
      ))}
    </div>

    <div className={styles.prescriptionFooter}>
      <Skeleton width="200px" height="60px" />
    </div>
  </div>
);

/**
 * Card Skeleton
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className={styles.cardGrid}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.card}>
        <Skeleton width="100%" height="200px" borderRadius="8px" className={styles.marginBottom} />
        <Skeleton width="100%" height="20px" className={styles.marginBottom} />
        <Skeleton width="80%" height="16px" />
      </div>
    ))}
  </div>
);

/**
 * Form Skeleton
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className={styles.form}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className={styles.formField}>
        <Skeleton width="100px" height="16px" className={styles.marginBottom} />
        <Skeleton width="100%" height="40px" borderRadius="6px" />
      </div>
    ))}
  </div>
);
