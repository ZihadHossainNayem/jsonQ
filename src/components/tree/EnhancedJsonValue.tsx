'use client';

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Edit2, Check, X, Copy, Expand, Eye, EyeOff } from 'lucide-react';

interface EnhancedJsonValueProps {
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  isEditable?: boolean;
  onValueChange?: (newValue: unknown) => void;
  searchQuery?: string;
  className?: string;
  maxStringLength?: number;
  showUnicodeEscapes?: boolean;
}

export const EnhancedJsonValue = memo(function EnhancedJsonValue({
  value,
  type,
  isEditable = false,
  onValueChange,
  searchQuery,
  className = '',
  maxStringLength = 100,
  showUnicodeEscapes = false,
}: EnhancedJsonValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEscapes, setShowEscapes] = useState(showUnicodeEscapes);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLongString =
    type === 'string' &&
    typeof value === 'string' &&
    value.length > maxStringLength;
  const isMultilineString =
    type === 'string' && typeof value === 'string' && value.includes('\n');

  const handleStartEdit = useCallback(() => {
    if (!isEditable || type === 'object' || type === 'array') return;
    setIsEditing(true);
    setEditValue(getEditableValue(value, type));
  }, [isEditable, type, value]);

  const handleSaveEdit = useCallback(() => {
    try {
      const newValue = parseEditValue(editValue, type);
      onValueChange?.(newValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Invalid value:', error);
    }
  }, [editValue, type, onValueChange]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const handleCopy = useCallback(async () => {
    try {
      const textToCopy = getDisplayValue(value, type, false, showEscapes);
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [value, type, showEscapes]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      if (isMultilineString && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, isMultilineString]);

  if (isEditing) {
    const EditComponent = isMultilineString ? 'textarea' : 'input';
    const editRef = isMultilineString ? textareaRef : inputRef;

    return (
      <div className={`inline-flex items-start gap-1 ${className}`}>
        <EditComponent
          ref={
            editRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>
          }
          type={isMultilineString ? undefined : 'text'}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          className={`
            px-2 py-1 text-sm rounded border resize-none
            ${getTypeStyles(type).editBg}
            focus:outline-none focus:ring-1 focus:ring-blue-500
            ${isMultilineString ? 'min-h-[60px] min-w-[200px]' : 'min-w-[100px]'}
          `}
          placeholder={getTypePlaceholder(type)}
          rows={isMultilineString ? 3 : undefined}
        />
        <div className='flex flex-col gap-1'>
          <button
            onClick={handleSaveEdit}
            className='p-0.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
            title='Save changes'
          >
            <Check className='w-3 h-3' />
          </button>
          <button
            onClick={handleCancelEdit}
            className='p-0.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
            title='Cancel changes'
          >
            <X className='w-3 h-3' />
          </button>
        </div>
      </div>
    );
  }

  const displayValue = getDisplayValue(
    value,
    type,
    !isExpanded && isLongString,
    showEscapes
  );
  const typeStyles = getTypeStyles(type);
  const highlightedValue = searchQuery
    ? highlightSearchMatch(displayValue, searchQuery)
    : displayValue;

  return (
    <>
      <div className={`inline-flex items-center gap-1 group ${className}`}>
        <span
          className={`
            text-sm font-mono break-all
            ${typeStyles.text}
            ${isEditable && type !== 'object' && type !== 'array' ? 'cursor-pointer hover:underline' : ''}
          `}
          onClick={handleStartEdit}
          dangerouslySetInnerHTML={{ __html: highlightedValue }}
        />

        {/* String length indicator */}
        {type === 'string' && typeof value === 'string' && value.length > 0 && (
          <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>
            {value.length} chars
          </span>
        )}

        {/* Object/Array size indicator */}
        {type === 'object' && (
          <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>
            {Object.keys(value as object).length} keys
          </span>
        )}

        {type === 'array' && (
          <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>
            {(value as unknown[]).length} items
          </span>
        )}

        <div className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
          {/* Long string controls */}
          {isLongString && (
            <>
              <button
                onClick={toggleExpanded}
                className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <Expand className='w-3 h-3' />
              </button>
              <button
                onClick={openModal}
                className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                title='View in modal'
              >
                <Eye className='w-3 h-3' />
              </button>
            </>
          )}

          {/* Unicode escape toggle for strings */}
          {type === 'string' && hasUnicodeCharacters(value as string) && (
            <button
              onClick={() => setShowEscapes(!showEscapes)}
              className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              title={
                showEscapes ? 'Hide Unicode escapes' : 'Show Unicode escapes'
              }
            >
              {showEscapes ? (
                <EyeOff className='w-3 h-3' />
              ) : (
                <Eye className='w-3 h-3' />
              )}
            </button>
          )}

          {/* Edit button */}
          {isEditable && type !== 'object' && type !== 'array' && (
            <button
              onClick={handleStartEdit}
              className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              title='Edit value'
            >
              <Edit2 className='w-3 h-3' />
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            title='Copy value'
          >
            <Copy className='w-3 h-3' />
          </button>
        </div>
      </div>

      {/* Modal for long strings */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full flex flex-col'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                String Value ({typeof value === 'string' ? value.length : 0}{' '}
                characters)
              </h3>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setShowEscapes(!showEscapes)}
                  className='px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  {showEscapes ? 'Hide' : 'Show'} Escapes
                </button>
                <button
                  onClick={closeModal}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>
            <div className='flex-1 overflow-auto p-4'>
              <pre className='text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words'>
                {getDisplayValue(value, type, false, showEscapes)}
              </pre>
            </div>
            <div className='flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700'>
              <button
                onClick={handleCopy}
                className='px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md'
              >
                Copy to Clipboard
              </button>
              <button
                onClick={closeModal}
                className='px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

// Helper functions
function getDisplayValue(
  value: unknown,
  type: string,
  truncate = false,
  showEscapes = false
): string {
  switch (type) {
    case 'string': {
      let str = String(value);

      if (showEscapes) {
        str = str
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, char => {
            return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
          });
      }

      if (truncate && str.length > 100) {
        str = str.substring(0, 100) + '...';
      }

      return `"${str}"`;
    }
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'object':
      return value === null ? 'null' : '{ ... }';
    case 'array':
      return '[ ... ]';
    default:
      return String(value);
  }
}

function getEditableValue(value: unknown, type: string): string {
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return '';
    default:
      return String(value);
  }
}

function parseEditValue(editValue: string, type: string): unknown {
  switch (type) {
    case 'string':
      return editValue;
    case 'number':
      const num = Number(editValue);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    case 'boolean':
      if (editValue.toLowerCase() === 'true') return true;
      if (editValue.toLowerCase() === 'false') return false;
      throw new Error('Invalid boolean');
    case 'null':
      return null;
    default:
      return editValue;
  }
}

function getTypeStyles(type: string) {
  switch (type) {
    case 'string':
      return {
        text: 'text-green-600 dark:text-green-400',
        editBg:
          'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600',
      };
    case 'number':
      return {
        text: 'text-blue-600 dark:text-blue-400',
        editBg:
          'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
      };
    case 'boolean':
      return {
        text: 'text-purple-600 dark:text-purple-400',
        editBg:
          'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600',
      };
    case 'null':
      return {
        text: 'text-gray-500 dark:text-gray-400 italic',
        editBg:
          'bg-gray-50 dark:bg-gray-900/30 border-gray-300 dark:border-gray-600',
      };
    case 'object':
      return {
        text: 'text-orange-600 dark:text-orange-400',
        editBg: '',
      };
    case 'array':
      return {
        text: 'text-red-600 dark:text-red-400',
        editBg: '',
      };
    default:
      return {
        text: 'text-gray-600 dark:text-gray-400',
        editBg:
          'bg-gray-50 dark:bg-gray-900/30 border-gray-300 dark:border-gray-600',
      };
  }
}

function getTypePlaceholder(type: string): string {
  switch (type) {
    case 'string':
      return 'Enter text';
    case 'number':
      return 'Enter number';
    case 'boolean':
      return 'true or false';
    case 'null':
      return 'null';
    default:
      return 'Enter value';
  }
}

function highlightSearchMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
  );
}

function hasUnicodeCharacters(str: string): boolean {
  return (
    /[\u0080-\uFFFF]/.test(str) || /[\u0000-\u001F\u007F-\u009F]/.test(str)
  );
}
