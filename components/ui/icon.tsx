"use client";

import { useEffect, useState } from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const iconFallbacks: { [key: string]: string } = {
  'arrow_back': '←',
  'edit': '✎',
  'download': '↓',
  'delete': '×',
  'add': '+',
  'close': '×',
  'menu': '☰',
  'refresh': '↻',
  'visibility': '👁',
  'picture_as_pdf': '📄',
  'image': '🖼',
  'receipt_long': '🧾',
  'zoom_in': '🔍',
  'expand_more': '▼',
  'chat': '💬',
  'warning': '⚠',
  'logout': '⏻',
  'dashboard': '📊',
  'people': '👥',
  'shopping_cart': '🛒',
  'calendar_today': '📅',
  'receipt': '🧾',
  'settings': '⚙',
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export default function Icon({ name, className = '', size = 'md' }: IconProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if Material Icons font is loaded
    if (document.fonts) {
      document.fonts.ready.then(() => {
        const materialFont = Array.from(document.fonts).find(
          font => font.family.includes('Material')
        );
        setFontsLoaded(!!materialFont);
      });
    }
  }, []);

  const fallback = iconFallbacks[name] || '●';
  const sizeClass = sizeClasses[size];

  if (!fontsLoaded) {
    // Use fallback while fonts are loading
    return (
      <span 
        className={`inline-block ${sizeClass} ${className}`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        title={name}
      >
        {fallback}
      </span>
    );
  }

  return (
    <span 
      className={`material-symbols-outlined ${sizeClass} ${className}`}
      data-icon={name}
    >
      {name}
    </span>
  );
}