'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import { TreeNode } from '@/types';
import { JsonNode } from './JsonNode';
import { LoadingSpinner } from '../ui';

interface LazyJsonArrayProps {
  node: TreeNode;
  level: number;
  onToggle: (path: string[]) => void;
  onEdit?: (path: string[], value: unknown) => void;
  onKeyEdit?: (path: string[], oldKey: string | number, newKey: string) => void;
  searchQuery?: string;
  className?: string;
  pageSize?: number;
  maxInitialItems?: number;
}

export const LazyJsonArray = memo(function LazyJsonArray({
  node,
  level,
  onToggle,
  onEdit,
  onKeyEdit,
  searchQuery = '',
  className = '',
  pageSize = 50,
  maxInitialItems = 100,
}: LazyJsonArrayProps) {
  const [loadedCount, setLoadedCount] = useState(
    Math.min(maxInitialItems, node.children?.length || 0)
  );
  const [isLoading, setIsLoading] = useState(false);

  const totalItems = node.children?.length || 0;
  const hasMore = loadedCount < totalItems;

  const visibleChildren = useMemo(() => {
    if (!node.children) return [];
    return node.children.slice(0, loadedCount);
  }, [node.children, loadedCount]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate async loading delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setLoadedCount(prev => Math.min(prev + pageSize, totalItems));
    setIsLoading(false);
  }, [isLoading, hasMore, pageSize, totalItems]);

  const handleLoadAll = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Simulate async loading delay for large datasets
    const remainingItems = totalItems - loadedCount;
    const delay = remainingItems > 1000 ? 1000 : 300;
    await new Promise(resolve => setTimeout(resolve, delay));

    setLoadedCount(totalItems);
    setIsLoading(false);
  }, [isLoading, totalItems, loadedCount]);

  // If it's a small array, render normally
  if (totalItems <= maxInitialItems) {
    return (
      <JsonNode
        node={node}
        level={level}
        onToggle={onToggle}
        onEdit={onEdit}
        onKeyEdit={onKeyEdit}
        searchQuery={searchQuery}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {/* Array header */}
      <div
        className={`
          flex items-center py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-colors duration-150 rounded-sm
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        <button
          onClick={() => onToggle(node.path)}
          className='flex items-center justify-center w-4 h-4 mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150'
          aria-label={node.isExpanded ? 'Collapse array' : 'Expand array'}
        >
          {node.isExpanded ? (
            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          ) : (
            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </button>

        <div className='mr-2 text-red-500 dark:text-red-400'>
          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
              clipRule='evenodd'
            />
          </svg>
        </div>

        {level > 0 && (
          <span className='font-medium text-sm text-purple-600 dark:text-purple-400 mr-2'>
            {node.key}:
          </span>
        )}

        <span className='text-sm font-mono text-red-600 dark:text-red-400'>
          [ ... ]
        </span>

        <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
          {totalItems} items
          {loadedCount < totalItems && ` (showing ${loadedCount})`}
        </span>
      </div>

      {/* Array items */}
      {node.isExpanded && (
        <div className='relative'>
          {/* Indent guide line */}
          <div
            className='absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700'
            style={{ left: `${level * 20 + 16}px` }}
          />

          {/* Visible children */}
          {visibleChildren.map((child, index) => (
            <JsonNode
              key={`${child.key}-${index}`}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onKeyEdit={onKeyEdit}
              searchQuery={searchQuery}
            />
          ))}

          {/* Load more controls */}
          {hasMore && (
            <div
              className='flex items-center gap-2 py-2 px-2 text-sm'
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              {isLoading ? (
                <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                  <LoadingSpinner size='sm' />
                  <span>Loading more items...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLoadMore}
                    className='
                      px-3 py-1 text-xs rounded-md
                      bg-blue-100 hover:bg-blue-200 text-blue-700
                      dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300
                      transition-colors duration-150
                    '
                  >
                    Load {Math.min(pageSize, totalItems - loadedCount)} more
                  </button>

                  {totalItems - loadedCount > pageSize && (
                    <button
                      onClick={handleLoadAll}
                      className='
                        px-3 py-1 text-xs rounded-md
                        bg-gray-100 hover:bg-gray-200 text-gray-700
                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300
                        transition-colors duration-150
                      '
                    >
                      Load all ({totalItems - loadedCount} remaining)
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
