'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  useCallback,
} from 'react';
import { Search, Expand, Minimize, X } from 'lucide-react';
import { TreeNode } from '@/types';
import { JsonNode } from './JsonNode';
import {
  searchTree,
  filterTreeBySearch,
  SearchOptions,
} from '@/utils/treeUtils';

interface JsonTreeProps {
  data: TreeNode | null;
  onNodeToggle: (path: string[]) => void;
  onNodeEdit?: (path: string[], value: unknown) => void;
  onKeyEdit?: (path: string[], oldKey: string | number, newKey: string) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export const JsonTree = memo(function JsonTree({
  data,
  onNodeToggle,
  onNodeEdit,
  onKeyEdit,
  onExpandAll,
  onCollapseAll,
  searchQuery = '',
  onSearchChange,
  className = '',
}: JsonTreeProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    regex: false,
    searchKeys: true,
    searchValues: true,
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Search results and filtered tree
  const searchResults = useMemo(() => {
    if (!data || !localSearchQuery.trim()) return [];
    return searchTree(data, localSearchQuery, searchOptions);
  }, [data, localSearchQuery, searchOptions]);

  const filteredTree = useMemo(() => {
    if (!data || !localSearchQuery.trim()) return data;
    return filterTreeBySearch(data, searchResults);
  }, [data, localSearchQuery, searchResults]);

  const displayTree = localSearchQuery.trim() ? filteredTree : data;

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    onSearchChange?.('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  // Add global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'e':
            e.preventDefault();
            onExpandAll?.();
            break;
          case 'r':
            e.preventDefault();
            onCollapseAll?.();
            break;
        }
      }

      if (e.key === 'Escape' && isSearchFocused) {
        handleClearSearch();
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, onExpandAll, onCollapseAll, handleClearSearch]);

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}
      >
        <div className='text-center'>
          <div className='text-4xl mb-2'>📄</div>
          <p>No JSON data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Controls */}
      <div className='flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
        {/* Search */}
        <div className='flex-1 relative'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              ref={searchInputRef}
              type='text'
              value={localSearchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder='Search keys and values... (⌘F)'
              className='
                w-full pl-10 pr-10 py-2 text-sm
                border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              '
            />
            {localSearchQuery && (
              <button
                onClick={handleClearSearch}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                title='Clear search'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* Search results count */}
          {localSearchQuery && (
            <div className='absolute top-full left-0 mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {searchResults.length} result
              {searchResults.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Search options */}
        <div className='flex items-center gap-1'>
          <button
            onClick={() =>
              setSearchOptions(prev => ({
                ...prev,
                caseSensitive: !prev.caseSensitive,
              }))
            }
            className={`
              px-2 py-1 text-xs rounded border
              ${
                searchOptions.caseSensitive
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }
              hover:bg-opacity-80 transition-colors
            `}
            title='Case sensitive search'
          >
            Aa
          </button>

          <button
            onClick={() =>
              setSearchOptions(prev => ({ ...prev, regex: !prev.regex }))
            }
            className={`
              px-2 py-1 text-xs rounded border
              ${
                searchOptions.regex
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }
              hover:bg-opacity-80 transition-colors
            `}
            title='Regular expression search'
          >
            .*
          </button>
        </div>

        {/* Expand/Collapse controls */}
        <div className='flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-2'>
          <button
            onClick={onExpandAll}
            className='
              p-2 text-gray-600 dark:text-gray-400
              hover:text-gray-800 dark:hover:text-gray-200
              hover:bg-gray-200 dark:hover:bg-gray-700
              rounded transition-colors
            '
            title='Expand all (⌘E)'
          >
            <Expand className='w-4 h-4' />
          </button>

          <button
            onClick={onCollapseAll}
            className='
              p-2 text-gray-600 dark:text-gray-400
              hover:text-gray-800 dark:hover:text-gray-200
              hover:bg-gray-200 dark:hover:bg-gray-700
              rounded transition-colors
            '
            title='Collapse all (⌘R)'
          >
            <Minimize className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Tree content */}
      <div
        ref={treeContainerRef}
        className='flex-1 overflow-auto bg-white dark:bg-gray-900'
        role='tree'
        aria-label='JSON tree view'
      >
        {displayTree ? (
          <div className='p-2'>
            <JsonNode
              node={displayTree}
              onToggle={onNodeToggle}
              onEdit={onNodeEdit}
              onKeyEdit={onKeyEdit}
              searchQuery={localSearchQuery}
              isSearchMatch={
                localSearchQuery
                  ? searchResults.some(result => result.node.path.length === 0)
                  : false
              }
            />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
            <div className='text-center'>
              <div className='text-4xl mb-2'>🔍</div>
              <p>No results found for &quot;{localSearchQuery}&quot;</p>
              <button
                onClick={handleClearSearch}
                className='mt-2 text-blue-600 dark:text-blue-400 hover:underline'
              >
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className='px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
        <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
          <div className='flex gap-4'>
            <span>⌘F: Search</span>
            <span>⌘E: Expand All</span>
            <span>⌘R: Collapse All</span>
          </div>
          <div>
            <span>ESC: Clear Search</span>
          </div>
        </div>
      </div>
    </div>
  );
});
