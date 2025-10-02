'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  resultCount?: number;
  currentResult?: number;
  placeholder?: string;
  className?: string;
  showNavigation?: boolean;
  regexEnabled?: boolean;
  onRegexToggle?: (enabled: boolean) => void;
  caseSensitive?: boolean;
  onCaseSensitiveToggle?: (enabled: boolean) => void;
}

export function SearchBar({
  value,
  onChange,
  onNext,
  onPrevious,
  resultCount = 0,
  currentResult = 0,
  placeholder = 'Search...',
  className = '',
  showNavigation = true,
  regexEnabled = false,
  onRegexToggle,
  caseSensitive = false,
  onCaseSensitiveToggle,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevious?.();
      } else {
        onNext?.();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
      inputRef.current?.blur();
    }
  };

  // Focus on Ctrl/Cmd + F
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search className='h-4 w-4 text-gray-400' />
        </div>

        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className='
            block w-full pl-10 pr-20 py-2 text-sm
            border border-gray-300 dark:border-gray-600 rounded-md
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          '
        />

        <div className='absolute inset-y-0 right-0 flex items-center'>
          {/* Result count */}
          {value && showNavigation && (
            <div className='flex items-center gap-1 px-2 text-xs text-gray-500 dark:text-gray-400'>
              {resultCount > 0 ? (
                <span>
                  {currentResult + 1} of {resultCount}
                </span>
              ) : (
                <span>No results</span>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          {value && showNavigation && resultCount > 0 && (
            <div className='flex items-center'>
              <button
                onClick={onPrevious}
                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                title='Previous result (Shift+Enter)'
                disabled={resultCount === 0}
              >
                <ChevronUp className='h-3 w-3' />
              </button>
              <button
                onClick={onNext}
                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                title='Next result (Enter)'
                disabled={resultCount === 0}
              >
                <ChevronDown className='h-3 w-3' />
              </button>
            </div>
          )}

          {/* Clear button */}
          {value && (
            <button
              onClick={handleClear}
              className='p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              title='Clear search (Esc)'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Search options */}
      {(onRegexToggle || onCaseSensitiveToggle) && isFocused && (
        <div className='absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10'>
          <div className='flex items-center gap-3 text-xs'>
            {onCaseSensitiveToggle && (
              <label className='flex items-center gap-1 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={caseSensitive}
                  onChange={e => onCaseSensitiveToggle(e.target.checked)}
                  className='rounded border-gray-300 dark:border-gray-600'
                />
                <span className='text-gray-700 dark:text-gray-300'>
                  Case sensitive
                </span>
              </label>
            )}

            {onRegexToggle && (
              <label className='flex items-center gap-1 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={regexEnabled}
                  onChange={e => onRegexToggle(e.target.checked)}
                  className='rounded border-gray-300 dark:border-gray-600'
                />
                <span className='text-gray-700 dark:text-gray-300'>
                  Regular expression
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {isFocused && (
        <div className='absolute top-full left-0 right-0 mt-1 p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-500 dark:text-gray-400'>
          <div className='flex justify-between'>
            <span>Enter: Next • Shift+Enter: Previous</span>
            <span>Esc: Clear • ⌘F: Focus</span>
          </div>
        </div>
      )}
    </div>
  );
}
