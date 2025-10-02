'use client';

import React, { useState } from 'react';
import { Expand, Minimize, ChevronDown, ChevronRight } from 'lucide-react';

interface ExpandCollapseButtonsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;

  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'combined' | 'separate';
  showLabels?: boolean;
}

export function ExpandCollapseButtons({
  onExpandAll,
  onCollapseAll,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'separate',
  showLabels = true,
}: ExpandCollapseButtonsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleExpandAll = async () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    onExpandAll();

    // Reset animation state after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCollapseAll = async () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    onCollapseAll();

    // Reset animation state after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const buttonBaseClasses = `
    inline-flex items-center gap-2 rounded-md font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-gray-100 hover:bg-gray-200 text-gray-700
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300
    ${getSizeClasses()}
  `;

  if (variant === 'combined') {
    return (
      <div className={`inline-flex rounded-md shadow-sm ${className}`}>
        <button
          onClick={handleExpandAll}
          disabled={disabled || isAnimating}
          className={`
            ${buttonBaseClasses}
            rounded-r-none border-r border-gray-300 dark:border-gray-600
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          title='Expand all nodes (⌘E)'
          aria-label='Expand all nodes'
        >
          <Expand
            className={`${getIconSize()} ${isAnimating ? 'animate-spin' : ''}`}
          />
          {showLabels && <span>Expand</span>}
        </button>

        <button
          onClick={handleCollapseAll}
          disabled={disabled || isAnimating}
          className={`
            ${buttonBaseClasses}
            rounded-l-none
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          title='Collapse all nodes (⌘R)'
          aria-label='Collapse all nodes'
        >
          <Minimize
            className={`${getIconSize()} ${isAnimating ? 'animate-spin' : ''}`}
          />
          {showLabels && <span>Collapse</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex gap-2 ${className}`}>
      <button
        onClick={handleExpandAll}
        disabled={disabled || isAnimating}
        className={`
          ${buttonBaseClasses}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title='Expand all nodes (⌘E)'
        aria-label='Expand all nodes'
      >
        <Expand
          className={`${getIconSize()} ${isAnimating ? 'animate-bounce' : ''}`}
        />
        {showLabels && <span>Expand All</span>}
      </button>

      <button
        onClick={handleCollapseAll}
        disabled={disabled || isAnimating}
        className={`
          ${buttonBaseClasses}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title='Collapse all nodes (⌘R)'
        aria-label='Collapse all nodes'
      >
        <Minimize
          className={`${getIconSize()} ${isAnimating ? 'animate-bounce' : ''}`}
        />
        {showLabels && <span>Collapse All</span>}
      </button>
    </div>
  );
}

// Specialized expand/collapse button for tree nodes
export function TreeNodeToggle({
  isExpanded,
  onToggle,
  disabled = false,
  className = '',
}: {
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        flex items-center justify-center w-4 h-4
        text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
    >
      {isExpanded ? (
        <ChevronDown className='w-3 h-3 transition-transform duration-150' />
      ) : (
        <ChevronRight className='w-3 h-3 transition-transform duration-150' />
      )}
    </button>
  );
}

// Quick action buttons for common operations
export function QuickExpandButton({
  onExpandAll,
  disabled = false,
  className = '',
}: {
  onExpandAll: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onExpandAll}
      disabled={disabled}
      className={`
        p-2 rounded-md text-gray-600 dark:text-gray-400
        hover:text-gray-800 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title='Expand all (⌘E)'
      aria-label='Expand all nodes'
    >
      <Expand className='w-4 h-4' />
    </button>
  );
}

export function QuickCollapseButton({
  onCollapseAll,
  disabled = false,
  className = '',
}: {
  onCollapseAll: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onCollapseAll}
      disabled={disabled}
      className={`
        p-2 rounded-md text-gray-600 dark:text-gray-400
        hover:text-gray-800 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title='Collapse all (⌘R)'
      aria-label='Collapse all nodes'
    >
      <Minimize className='w-4 h-4' />
    </button>
  );
}
