/**
 * MoodBook — PixelCard Component
 * Container card with optional header
 */

import React from 'react';

interface PixelCardProps {
  title?: string;
  titleIcon?: string;
  children: React.ReactNode;
  className?: string;
  headerColor?: string;
  style?: React.CSSProperties;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  title,
  titleIcon,
  children,
  className = '',
  headerColor,
  style,
}) => {
  return (
    <div className={`pixel-card ${className}`} style={style}>
      {title && (
        <div
          className="pixel-card-header"
          style={headerColor ? { backgroundColor: headerColor } : undefined}
        >
          {titleIcon && <span>{titleIcon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
