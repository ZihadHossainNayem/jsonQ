'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Edit2, Check, X, Copy } from 'lucide-react';

interface JsonValueProps {
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  isEditable?: boolean;
  onValueChange?: (newValue: unknown) => void;
  searchQuery?: string;
  className?: string;
}

export const JsonValue = memo(function JsonValue({
  value,
  type,
  isEditable = false,
  onValueChange,
  searchQuery,
  className = '',
}: JsonValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    if (!isEditable || type === 'object' || type === 'array') return;
    setIsEditing(true);
    setEditValue(getEditableValue(value, type));
  };

  const handleSaveEdit = () => {
    try {
      const newValue = parseEditValue(editValue, type);
      onValueChange?.(newValue);
      setIsEditing(false);
    } catch (error) {
      // Show error or keep editing
      console.error('Invalid value:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = getDisplayValue(value, type);
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <input
          ref={inputRef}
          type='text'
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          className={`
            px-2 py-1 text-sm rounded border
            ${getTypeStyles(type).editBg}
            focus:outline-none focus:ring-1 focus:ring-blue-500
            min-w-[100px]
          `}
          placeholder={getTypePlaceholder(type)}
        />
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
    );
  }

  const displayValue = getDisplayValue(value, type);
  const typeStyles = getTypeStyles(type);
  const highlightedValue = searchQuery
    ? highlightSearchMatch(displayValue, searchQuery)
    : displayValue;

  return (
    <div className={`inline-flex items-center gap-1 group ${className}`}>
      <span
        className={`
          text-sm font-mono
          ${typeStyles.text}
          ${isEditable && type !== 'object' && type !== 'array' ? 'cursor-pointer hover:underline' : ''}
        `}
        onClick={handleStartEdit}
        dangerouslySetInnerHTML={{ __html: highlightedValue }}
      />

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
        {isEditable && type !== 'object' && type !== 'array' && (
          <button
            onClick={handleStartEdit}
            className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            title='Edit value'
          >
            <Edit2 className='w-3 h-3' />
          </button>
        )}

        <button
          onClick={handleCopy}
          className='p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          title='Copy value'
        >
          <Copy className='w-3 h-3' />
        </button>
      </div>
    </div>
  );
});

// Helper functions
function getDisplayValue(value: unknown, type: string): string {
  switch (type) {
    case 'string':
      return `"${value}"`;
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'object':
      return '{ ... }';
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
        text: 'text-gray-500 dark:text-gray-400',
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
