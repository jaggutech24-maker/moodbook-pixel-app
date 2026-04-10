/**
 * MoodBook — PixelButton Component
 * Reusable pixel-art styled button with press animation
 */

import React, { useState } from 'react';
import { sounds } from '../lib/sounds';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'brown';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  playSound?: boolean;
}

const variantClass: Record<string, string> = {
  default: 'pixel-button',
  blue: 'pixel-button pixel-button-blue',
  green: 'pixel-button pixel-button-green',
  yellow: 'pixel-button pixel-button-yellow',
  red: 'pixel-button pixel-button-red',
  brown: 'pixel-button',
};

const sizeStyle: Record<string, React.CSSProperties> = {
  sm: { fontSize: '11px', padding: '5px 10px' },
  md: { fontSize: '13px', padding: '8px 16px' },
  lg: { fontSize: '15px', padding: '12px 24px' },
};

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  playSound = true,
  onClick,
  className = '',
  style,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);

  const handleMouseDown = () => setPressed(true);
  const handleMouseUp = () => setPressed(false);
  const handleMouseLeave = () => setPressed(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound) sounds.click();
    onClick?.(e);
  };

  return (
    <button
      className={`${variantClass[variant]} ${pressed ? 'pressed' : ''} ${className}`}
      style={{ ...sizeStyle[size], ...style }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
