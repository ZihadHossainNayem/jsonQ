'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ValidationDisplayProps {
  error?: string;
  isValid: boolean;
  errorLocation?: { line: number; column: number };
  className?: string;
}

export function ValidationDisplay({
  error,
  isValid,
  errorLocation,
  className = '',
}: ValidationDisplayProps) {
  // Success state - show when valid and there's content
  if (isValid && !error) {
    return (
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg
          bg-green-50 border border-green-200
          dark:bg-green-900/20 dark:border-green-800
          ${className}
        `}
        role='status'
        aria-live='polite'
      >
        <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5' />
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-green-800 dark:text-green-200'>
            Valid JSON
          </h3>
          <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
            Your JSON is properly formatted and ready to use.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!isValid && error) {
    return (
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg
          bg-red-50 border border-red-200
          dark:bg-red-900/20 dark:border-red-800
          ${className}
        `}
        role='alert'
        aria-live='assertive'
      >
        <XCircle className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
            JSON Validation Error
          </h3>
          <p className='text-sm text-red-700 dark:text-red-300 mt-1'>{error}</p>

          {/* Error location display */}
          {errorLocation && (
            <div className='mt-3 p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 text-red-600 dark:text-red-400' />
                <span className='text-xs font-medium text-red-800 dark:text-red-200'>
                  Error Location
                </span>
              </div>
              <p className='text-xs text-red-700 dark:text-red-300 mt-1'>
                Line {errorLocation.line}, Column {errorLocation.column}
              </p>
            </div>
          )}

          {/* Helpful suggestions */}
          <div className='mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'>
            <div className='flex items-center gap-2'>
              <Info className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <span className='text-xs font-medium text-blue-800 dark:text-blue-200'>
                Common Solutions
              </span>
            </div>
            <ul className='text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1'>
              <li>• Check for missing or extra commas</li>
              <li>• Ensure all strings are wrapped in double quotes</li>
              <li>• Verify all brackets and braces are properly closed</li>
              <li>• Remove any trailing commas after the last item</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
