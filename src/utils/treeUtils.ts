import { TreeNode } from '@/types';

// Enhanced tree building utilities
export function getValueType(value: unknown): TreeNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'null';
}

export function buildTreeNode(
  data: unknown,
  path: string[] = [],
  key: string | number = 'root',
  parent?: TreeNode
): TreeNode {
  const type = getValueType(data);

  const node: TreeNode = {
    key,
    value: data,
    type,
    path,
    isExpanded: path.length < 2, // Auto-expand first two levels
    children: undefined,
    parent,
  };

  if (type === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    node.children = Object.keys(obj).map(childKey =>
      buildTreeNode(obj[childKey], [...path, childKey], childKey, node)
    );
  } else if (type === 'array') {
    const arr = data as unknown[];
    node.children = arr.map((item, index) =>
      buildTreeNode(item, [...path, index.toString()], index, node)
    );
  }

  return node;
}

export function updateTreeNode(
  tree: TreeNode,
  targetPath: string[],
  newValue: unknown
): TreeNode {
  if (targetPath.length === 0) {
    return {
      ...tree,
      value: newValue,
      type: getValueType(newValue),
    };
  }

  const [currentKey, ...remainingPath] = targetPath;

  if (tree.children) {
    const updatedChildren = tree.children.map(child => {
      if (child.key.toString() === currentKey) {
        return updateTreeNode(child, remainingPath, newValue);
      }
      return child;
    });

    return {
      ...tree,
      children: updatedChildren,
    };
  }

  return tree;
}

export function getNodePath(path: string[]): string {
  return path.join('.');
}

export function expandAllTreeNodes(node: TreeNode): TreeNode {
  const updatedNode = { ...node, isExpanded: true };

  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(child =>
      expandAllTreeNodes(child)
    );
  }

  return updatedNode;
}

export function collapseAllTreeNodes(node: TreeNode): TreeNode {
  const updatedNode = { ...node, isExpanded: false };

  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(child =>
      collapseAllTreeNodes(child)
    );
  }

  return updatedNode;
}

export function toggleTreeNodeExpansion(
  node: TreeNode,
  targetPath: string[]
): TreeNode {
  if (targetPath.length === 0) {
    return { ...node, isExpanded: !node.isExpanded };
  }

  const [currentKey, ...remainingPath] = targetPath;

  if (node.children) {
    const updatedChildren = node.children.map(child => {
      if (child.key.toString() === currentKey) {
        return toggleTreeNodeExpansion(child, remainingPath);
      }
      return child;
    });

    return {
      ...node,
      children: updatedChildren,
    };
  }

  return node;
}

// Search and filtering utilities
export interface SearchOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  searchKeys?: boolean;
  searchValues?: boolean;
}

export interface SearchResult {
  node: TreeNode;
  matchType: 'key' | 'value';
  matchText: string;
}

export function searchTree(
  node: TreeNode,
  query: string,
  options: SearchOptions = {
    caseSensitive: false,
    regex: false,
    searchKeys: true,
    searchValues: true,
  }
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];
  const searchQuery = options.caseSensitive ? query : query.toLowerCase();

  function searchNode(currentNode: TreeNode) {
    // Search in key
    if (options.searchKeys) {
      const keyStr = currentNode.key.toString();
      const searchKeyStr = options.caseSensitive
        ? keyStr
        : keyStr.toLowerCase();

      let matches = false;
      if (options.regex) {
        try {
          const regex = new RegExp(
            searchQuery,
            options.caseSensitive ? 'g' : 'gi'
          );
          matches = regex.test(searchKeyStr);
        } catch {
          // Fallback to simple string search if regex is invalid
          matches = searchKeyStr.includes(searchQuery);
        }
      } else {
        matches = searchKeyStr.includes(searchQuery);
      }

      if (matches) {
        results.push({
          node: currentNode,
          matchType: 'key',
          matchText: keyStr,
        });
      }
    }

    // Search in value (for primitive types)
    if (
      options.searchValues &&
      currentNode.type !== 'object' &&
      currentNode.type !== 'array'
    ) {
      const valueStr = String(currentNode.value);
      const searchValueStr = options.caseSensitive
        ? valueStr
        : valueStr.toLowerCase();

      let matches = false;
      if (options.regex) {
        try {
          const regex = new RegExp(
            searchQuery,
            options.caseSensitive ? 'g' : 'gi'
          );
          matches = regex.test(searchValueStr);
        } catch {
          matches = searchValueStr.includes(searchQuery);
        }
      } else {
        matches = searchValueStr.includes(searchQuery);
      }

      if (matches) {
        results.push({
          node: currentNode,
          matchType: 'value',
          matchText: valueStr,
        });
      }
    }

    // Recursively search children
    if (currentNode.children) {
      currentNode.children.forEach(searchNode);
    }
  }

  searchNode(node);
  return results;
}

export function highlightSearchMatches(
  text: string,
  query: string,
  options: SearchOptions = { caseSensitive: false, regex: false }
): string {
  if (!query.trim()) return text;

  const searchQuery = options.caseSensitive ? query : query.toLowerCase();
  const searchText = options.caseSensitive ? text : text.toLowerCase();

  if (options.regex) {
    try {
      const regex = new RegExp(
        `(${query})`,
        options.caseSensitive ? 'g' : 'gi'
      );
      return text.replace(regex, '<mark>$1</mark>');
    } catch {
      // Fallback to simple highlighting
      const index = searchText.indexOf(searchQuery);
      if (index !== -1) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);
        return `${before}<mark>${match}</mark>${after}`;
      }
    }
  } else {
    const index = searchText.indexOf(searchQuery);
    if (index !== -1) {
      const before = text.substring(0, index);
      const match = text.substring(index, index + query.length);
      const after = text.substring(index + query.length);
      return `${before}<mark>${match}</mark>${after}`;
    }
  }

  return text;
}

export function filterTreeBySearch(
  node: TreeNode,
  searchResults: SearchResult[]
): TreeNode | null {
  const matchingPaths = new Set(
    searchResults.map(result => getNodePath(result.node.path))
  );

  function shouldIncludeNode(currentNode: TreeNode): boolean {
    const nodePath = getNodePath(currentNode.path);

    // Include if this node matches
    if (matchingPaths.has(nodePath)) return true;

    // Include if any descendant matches
    if (currentNode.children) {
      return currentNode.children.some(child => shouldIncludeNode(child));
    }

    return false;
  }

  function filterNode(currentNode: TreeNode): TreeNode | null {
    if (!shouldIncludeNode(currentNode)) return null;

    const filteredChildren = currentNode.children
      ?.map(child => filterNode(child))
      .filter((child): child is TreeNode => child !== null);

    return {
      ...currentNode,
      children: filteredChildren,
      isExpanded: true, // Expand nodes to show search results
    };
  }

  return filterNode(node);
}

// Utility to collect all expanded paths
export function collectExpandedPaths(
  node: TreeNode,
  currentPath: string = ''
): Set<string> {
  const paths = new Set<string>();

  if (node.isExpanded && currentPath) {
    paths.add(currentPath);
  }

  if (node.children) {
    node.children.forEach(child => {
      const childPath = currentPath
        ? `${currentPath}.${child.key}`
        : child.key.toString();
      const childPaths = collectExpandedPaths(child, childPath);
      childPaths.forEach(path => paths.add(path));
    });
  }

  return paths;
}

// Utility to collect all node paths
export function collectAllPaths(
  node: TreeNode,
  currentPath: string = ''
): string[] {
  const paths: string[] = [];

  if (currentPath) {
    paths.push(currentPath);
  }

  if (node.children) {
    node.children.forEach(child => {
      const childPath = currentPath
        ? `${currentPath}.${child.key}`
        : child.key.toString();
      paths.push(...collectAllPaths(child, childPath));
    });
  }

  return paths;
}

// Utility to reconstruct JSON from tree
export function reconstructJsonFromTree(node: TreeNode): unknown {
  if (node.type === 'object' && node.children) {
    const obj: Record<string, unknown> = {};
    node.children.forEach(child => {
      obj[child.key.toString()] = reconstructJsonFromTree(child);
    });
    return obj;
  }

  if (node.type === 'array' && node.children) {
    return node.children.map(child => reconstructJsonFromTree(child));
  }

  return node.value;
}
