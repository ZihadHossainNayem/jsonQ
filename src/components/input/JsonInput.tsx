'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useJsonContext } from '@/components/providers/JsonContextProvider';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface JsonInputProps {
  placeholder?: string;
  className?: string;
}

export function JsonInput({
  placeholder = 'Paste your JSON here...',
  className = '',
}: JsonInputProps) {
  const { state, setJson, clearJson } = useJsonContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(state.rawInput);

  // Auto-resize functionality
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Handle input changes with real-time validation
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setLocalValue(value);
      setJson(value);

      // Adjust height after state update
      setTimeout(adjustTextareaHeight, 0);
    },
    [setJson, adjustTextareaHeight]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    setLocalValue('');
    clearJson();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [clearJson]);

  // Sync local value with context state
  useEffect(() => {
    if (state.rawInput !== localValue) {
      setLocalValue(state.rawInput);
    }
  }, [state.rawInput, localValue]);

  // Adjust height on mount and when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [localValue, adjustTextareaHeight]);

  // Handle paste events for better UX
  const handlePaste = useCallback(() => {
    // Let the default paste behavior happen, then adjust height
    setTimeout(adjustTextareaHeight, 0);
  }, [adjustTextareaHeight]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + A to select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        textareaRef.current?.select();
      }

      // Ctrl/Cmd + K to clear
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        handleClear();
      }
    },
    [handleClear]
  );

  const hasContent = localValue.trim().length > 0;
  const hasError = !state.jsonData.isValid && hasContent;

  return (
    <div className={`relative ${className}`}>
      <div className='relative'>
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full min-h-[300px] p-4 pr-12
            border border-gray-300 rounded-lg resize-none
            font-mono text-sm leading-relaxed
            transition-colors duration-200
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            bg-white
            ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : state.jsonData.isValid && hasContent
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : ''
            }
            dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
            dark:placeholder-gray-400
            ${
              hasError
                ? 'dark:border-red-500 dark:focus:border-red-400'
                : state.jsonData.isValid && hasContent
                  ? 'dark:border-green-500 dark:focus:border-green-400'
                  : 'dark:focus:border-blue-400'
            }
          `}
          spellCheck={false}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
        />

        {hasContent && (
          <button
            onClick={handleClear}
            className='
              absolute top-4 right-4 p-1
              text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
              transition-colors duration-200
              focus:outline-none
            '
            title='Clear (⌘K)'
            aria-label='Clear JSON input'
          >
            <X className='w-4 h-4' />
          </button>
        )}

        {/* Status indicator */}
        {hasContent && (
          <div className='absolute bottom-4 right-4'>
            {state.jsonData.isValid ? (
              <div title='Valid JSON'>
                <CheckCircle className='w-5 h-5 text-green-500' />
              </div>
            ) : (
              <div title='Invalid JSON'>
                <XCircle className='w-5 h-5 text-red-500' />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className='flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400'>
        <div className='flex gap-4'>
          <span>{localValue.length} characters</span>
          {localValue.length > 0 && (
            <span>{localValue.split('\n').length} lines</span>
          )}
        </div>
        <div className='flex gap-3'>
          <span>⌘A: Select All</span>
          <span>⌘K: Clear</span>
        </div>
      </div>
    </div>
  );
}
