'use client';

import React, { useState, useRef, useMemo, memo, useCallback } from 'react';
import { TreeNode } from '@/types';
import { JsonNode } from './JsonNode';

interface VirtualizedJsonTreeProps {
  data: TreeNode | null;
  onNodeToggle: (path: string[]) => void;
  onNodeEdit?: (path: string[], value: unknown) => void;
  onKeyEdit?: (path: string[], oldKey: string | number, newKey: string) => void;
  searchQuery?: string;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

interface FlattenedNode {
  node: TreeNode;
  level: number;
  index: number;
}

export const VirtualizedJsonTree = memo(function VirtualizedJsonTree({
  data,
  onNodeToggle,
  onNodeEdit,
  onKeyEdit,
  searchQuery = '',
  className = '',
  itemHeight = 32,
  containerHeight = 400,
  overscan = 5,
}: VirtualizedJsonTreeProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten the tree structure for virtualization
  const flattenedNodes = useMemo(() => {
    if (!data) return [];

    const flatten = (node: TreeNode, level: number = 0): FlattenedNode[] => {
      const result: FlattenedNode[] = [{ node, level, index: 0 }];

      if (node.isExpanded && node.children) {
        node.children.forEach(child => {
          result.push(...flatten(child, level + 1));
        });
      }

      return result;
    };

    const flattened = flatten(data);
    return flattened.map((item, index) => ({ ...item, index }));
  }, [data]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const totalItems = flattenedNodes.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan, totalItems);
    const adjustedStartIndex = Math.max(0, startIndex - overscan);

    return {
      start: adjustedStartIndex,
      end: endIndex,
      visibleCount,
      totalHeight: totalItems * itemHeight,
    };
  }, [scrollTop, flattenedNodes.length, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleNodes = useMemo(() => {
    return flattenedNodes.slice(visibleRange.start, visibleRange.end);
  }, [flattenedNodes, visibleRange.start, visibleRange.end]);

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
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleRange.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleNodes.map(({ node, level, index }) => (
            <div
              key={`${node.path.join('.')}-${index}`}
              style={{ height: itemHeight }}
              className='flex items-center'
            >
              <JsonNode
                node={node}
                level={level}
                onToggle={onNodeToggle}
                onEdit={onNodeEdit}
                onKeyEdit={onKeyEdit}
                searchQuery={searchQuery}
                isSearchMatch={
                  searchQuery ? isNodeMatch(node, searchQuery) : false
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Helper function for search matching
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
