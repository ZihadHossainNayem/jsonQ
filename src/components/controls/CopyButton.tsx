'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface CopyButtonProps {
  data: unknown;
  format?: 'minified' | 'formatted';
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function CopyButton({
  data,
  format = 'formatted',
  label,
  className = '',
  size = 'md',
  variant = 'secondary',
}: CopyButtonProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  const handleCopy = async () => {
    try {
      let textToCopy: string;

      if (typeof data === 'string') {
        textToCopy = data;
      } else {
        textToCopy =
          format === 'minified'
            ? JSON.stringify(data)
            : JSON.stringify(data, null, 2);
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopyState('success');

      // Reset state after 2 seconds
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyState('error');

      // Reset state after 3 seconds
      setTimeout(() => setCopyState('idle'), 3000);
    }
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

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-blue-500 dark:hover:bg-blue-600
          focus:ring-blue-500
        `;
      case 'ghost':
        return `
          bg-transparent hover:bg-gray-100 text-gray-600
          dark:hover:bg-gray-800 dark:text-gray-400
          focus:ring-gray-500
        `;
      default:
        return `
          bg-gray-100 hover:bg-gray-200 text-gray-700
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300
          focus:ring-gray-500
        `;
    }
  };

  const getIcon = () => {
    const iconSize =
      size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    switch (copyState) {
      case 'success':
        return (
          <Check className={`${iconSize} text-green-600 dark:text-green-400`} />
        );
      case 'error':
        return (
          <AlertCircle
            className={`${iconSize} text-red-600 dark:text-red-400`}
          />
        );
      default:
        return <Copy className={iconSize} />;
    }
  };

  const getButtonText = () => {
    if (label) return label;

    switch (copyState) {
      case 'success':
        return 'Copied!';
      case 'error':
        return 'Failed';
      default:
        return 'Copy';
    }
  };

  const getTitle = () => {
    switch (copyState) {
      case 'success':
        return 'Successfully copied to clipboard';
      case 'error':
        return 'Failed to copy to clipboard';
      default:
        return `Copy JSON (${format})`;
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={copyState !== 'idle'}
      className={`
        inline-flex items-center gap-2 rounded-md font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
      {(label || size !== 'sm') && (
        <span
          className={
            copyState === 'success' ? 'text-green-600 dark:text-green-400' : ''
          }
        >
          {getButtonText()}
        </span>
      )}
    </button>
  );
}

// Specialized copy buttons for common use cases
export function CopyJsonButton({
  data,
  className = '',
}: {
  data: unknown;
  className?: string;
}) {
  return (
    <CopyButton
      data={data}
      format='formatted'
      label='Copy JSON'
      variant='secondary'
      className={className}
    />
  );
}

export function CopyMinifiedButton({
  data,
  className = '',
}: {
  data: unknown;
  className?: string;
}) {
  return (
    <CopyButton
      data={data}
      format='minified'
      label='Copy Minified'
      variant='ghost'
      size='sm'
      className={className}
    />
  );
}

export function CopyIconButton({
  data,
  className = '',
}: {
  data: unknown;
  className?: string;
}) {
  return (
    <CopyButton
      data={data}
      format='formatted'
      variant='ghost'
      size='sm'
      className={className}
    />
  );
}
