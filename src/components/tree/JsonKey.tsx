'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface JsonKeyProps {
  keyName: string | number;
  path: string[];
  isEditable?: boolean;
  onKeyChange?: (oldKey: string | number, newKey: string) => void;
  className?: string;
}

export const JsonKey = memo(function JsonKey({
  keyName,
  path,
  isEditable = false,
  onKeyChange,
  className = '',
}: JsonKeyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(keyName.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
    setEditValue(keyName.toString());
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== keyName.toString()) {
      onKeyChange?.(keyName, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(keyName.toString());
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

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Generate breadcrumb path
  const breadcrumbPath = path.length > 0 ? path.join(' › ') : '';

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
          className='
            px-1 py-0.5 text-sm font-medium
            bg-blue-50 dark:bg-blue-900/30
            border border-blue-300 dark:border-blue-600
            rounded text-blue-800 dark:text-blue-200
            focus:outline-none focus:ring-1 focus:ring-blue-500
            min-w-[60px]
          '
          placeholder='Key name'
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

  return (
    <div className={`inline-flex items-center gap-1 group ${className}`}>
      <span
        className={`
          font-medium text-sm
          ${
            typeof keyName === 'number'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-blue-600 dark:text-blue-400'
          }
          ${isEditable ? 'cursor-pointer hover:underline' : ''}
        `}
        onClick={handleStartEdit}
        title={breadcrumbPath ? `Path: ${breadcrumbPath}` : undefined}
      >
        {typeof keyName === 'string' ? `"${keyName}"` : keyName}
      </span>

      {isEditable && (
        <button
          onClick={handleStartEdit}
          className='
            opacity-0 group-hover:opacity-100 transition-opacity
            p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
          '
          title='Edit key'
        >
          <Edit2 className='w-3 h-3' />
        </button>
      )}

      <span className='text-gray-500 dark:text-gray-400'>:</span>
    </div>
  );
});
