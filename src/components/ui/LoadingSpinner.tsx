'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  className = '',
  label,
  color = 'primary',
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'text-gray-500 dark:text-gray-400';
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const renderSpinner = () => {
    const sizeClasses = getSizeClasses();
    const colorClasses = getColorClasses();

    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`
                  rounded-full animate-pulse
                  ${size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-2 h-2'}
                  ${colorClasses.replace('text-', 'bg-')}
                `}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={`
              rounded-full animate-pulse
              ${sizeClasses}
              ${colorClasses.replace('text-', 'bg-')}
              ${className}
            `}
          />
        );

      case 'bars':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`
                  animate-pulse
                  ${size === 'sm' ? 'w-0.5 h-3' : size === 'lg' ? 'w-1 h-6' : size === 'xl' ? 'w-1.5 h-8' : 'w-1 h-4'}
                  ${colorClasses.replace('text-', 'bg-')}
                `}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <Loader2
            className={`animate-spin ${sizeClasses} ${colorClasses} ${className}`}
          />
        );
    }
  };

  if (label) {
    return (
      <div className='flex items-center gap-2'>
        {renderSpinner()}
        <span className={`text-sm ${getColorClasses()}`}>{label}</span>
      </div>
    );
  }

  return renderSpinner();
}

// Specialized loading components
export function FileLoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <LoadingSpinner
      size='md'
      variant='spinner'
      label='Loading file...'
      color='primary'
      className={className}
    />
  );
}

export function ProcessingSpinner({ className = '' }: { className?: string }) {
  return (
    <LoadingSpinner
      size='sm'
      variant='dots'
      label='Processing...'
      color='secondary'
      className={className}
    />
  );
}

export function FullPageLoader({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <div className='fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50'>
      <div className='text-center'>
        <LoadingSpinner size='xl' variant='spinner' color='primary' />
        <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
          {message}
        </p>
      </div>
    </div>
  );
}

// Loading overlay for specific components
export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  className = '',
}: {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className='absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center rounded-lg'>
          <div className='text-center'>
            <LoadingSpinner size='lg' variant='spinner' color='primary' />
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
