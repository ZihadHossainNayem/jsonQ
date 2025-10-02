'use client';

import React, { memo, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Circle,
  Square,
  Hash,
  Type,
  ToggleLeft,
  FileText,
  List,
} from 'lucide-react';
import { TreeNode } from '@/types';
import { JsonKey } from './JsonKey';
import { JsonValue } from './JsonValue';

interface JsonNodeProps {
  node: TreeNode;
  level?: number;
  onToggle: (path: string[]) => void;
  onEdit?: (path: string[], value: unknown) => void;
  onKeyEdit?: (path: string[], oldKey: string | number, newKey: string) => void;
  searchQuery?: string;
  isSearchMatch?: boolean;
  className?: string;
}

export const JsonNode = memo(function JsonNode({
  node,
  level = 0,
  onToggle,
  onEdit,
  onKeyEdit,
  searchQuery,
  isSearchMatch = false,
  className = '',
}: JsonNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpandable = node.type === 'object' || node.type === 'array';
  const indentLevel = level * 20;

  const handleToggle = useCallback(() => {
    if (isExpandable) {
      onToggle(node.path);
    }
  }, [isExpandable, onToggle, node.path]);

  const handleValueEdit = useCallback(
    (newValue: unknown) => {
      onEdit?.(node.path, newValue);
    },
    [onEdit, node.path]
  );

  const handleKeyEdit = useCallback(
    (oldKey: string | number, newKey: string) => {
      onKeyEdit?.(node.path, oldKey, newKey);
    },
    [onKeyEdit, node.path]
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return <FileText className='w-3 h-3' />;
      case 'array':
        return <List className='w-3 h-3' />;
      case 'string':
        return <Type className='w-3 h-3' />;
      case 'number':
        return <Hash className='w-3 h-3' />;
      case 'boolean':
        return <ToggleLeft className='w-3 h-3' />;
      case 'null':
        return <Circle className='w-3 h-3' />;
      default:
        return <Square className='w-3 h-3' />;
    }
  };

  return (
    <div
      className={`${className} ${isSearchMatch ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
    >
      {/* Current node */}
      <div
        className={`
          flex items-center py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-colors duration-150 rounded-sm
          ${isSearchMatch ? 'ring-1 ring-yellow-300 dark:ring-yellow-600' : ''}
        `}
        style={{ paddingLeft: `${indentLevel + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleToggle}
          className={`
            flex items-center justify-center w-4 h-4 mr-2
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
            transition-colors duration-150
            ${isExpandable ? 'cursor-pointer' : 'cursor-default opacity-50'}
          `}
          disabled={!isExpandable}
          aria-label={
            isExpandable
              ? node.isExpanded
                ? 'Collapse'
                : 'Expand'
              : 'No children'
          }
        >
          {isExpandable ? (
            node.isExpanded ? (
              <ChevronDown className='w-3 h-3' />
            ) : (
              <ChevronRight className='w-3 h-3' />
            )
          ) : (
            <div className='w-3 h-3' />
          )}
        </button>

        {/* Type icon */}
        <div className={`mr-2 ${getTypeIconColor(node.type)}`}>
          {getTypeIcon(node.type)}
        </div>

        {/* Key (for non-root nodes) */}
        {level > 0 && (
          <JsonKey
            keyName={node.key}
            path={node.path}
            isEditable={!!onKeyEdit}
            onKeyChange={handleKeyEdit}
            className='mr-2'
          />
        )}

        {/* Value */}
        <JsonValue
          value={node.value}
          type={node.type}
          isEditable={!!onEdit}
          onValueChange={handleValueEdit}
          searchQuery={searchQuery}
        />

        {/* Expand indicator for collapsed containers */}
        {isExpandable && !node.isExpanded && hasChildren && (
          <span className='ml-2 text-xs text-gray-400 dark:text-gray-500'>
            {node.type === 'object'
              ? `{${node.children!.length} keys}`
              : `[${node.children!.length} items]`}
          </span>
        )}
      </div>

      {/* Children */}
      {node.isExpanded && hasChildren && (
        <div className='relative'>
          {/* Indent guide line */}
          <div
            className='absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700'
            style={{ left: `${indentLevel + 16}px` }}
          />

          {node.children!.map((child, index) => (
            <JsonNode
              key={`${child.key}-${index}`}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onKeyEdit={onKeyEdit}
              searchQuery={searchQuery}
              isSearchMatch={
                searchQuery ? isNodeMatch(child, searchQuery) : false
              }
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Helper functions
function getTypeIconColor(type: string): string {
  switch (type) {
    case 'object':
      return 'text-orange-500 dark:text-orange-400';
    case 'array':
      return 'text-red-500 dark:text-red-400';
    case 'string':
      return 'text-green-500 dark:text-green-400';
    case 'number':
      return 'text-blue-500 dark:text-blue-400';
    case 'boolean':
      return 'text-purple-500 dark:text-purple-400';
    case 'null':
      return 'text-gray-400 dark:text-gray-500';
    default:
      return 'text-gray-400 dark:text-gray-500';
  }
}

function isNodeMatch(node: TreeNode, query: string): boolean {
  if (!query.trim()) return false;

  const lowerQuery = query.toLowerCase();
  const keyMatch = node.key.toString().toLowerCase().includes(lowerQuery);

  if (node.type !== 'object' && node.type !== 'array') {
    const valueMatch = String(node.value).toLowerCase().includes(lowerQuery);
    return keyMatch || valueMatch;
  }

  return keyMatch;
}
