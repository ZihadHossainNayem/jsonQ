import { JsonData, TreeNode } from '@/types/json';

// JSON Validation utilities
function extractErrorLocation(
  errorMessage: string,
  input: string
): { line: number; column: number } | undefined {
  // Try to extract line and column from error message
  const positionMatch = errorMessage.match(/position (\d+)/);
  if (positionMatch) {
    const position = parseInt(positionMatch[1]);
    const lines = input.substring(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }
  return undefined;
}

function formatErrorMessage(errorMessage: string): string {
  // Convert technical JSON errors to user-friendly messages
  if (errorMessage.includes('Unexpected token')) {
    return 'Syntax error: Unexpected character found. Check for missing quotes, commas, or brackets.';
  }
  if (errorMessage.includes('Unexpected end of JSON input')) {
    return 'Incomplete JSON: The JSON appears to be cut off or missing closing brackets.';
  }
  if (errorMessage.includes('Expected property name')) {
    return 'Property name error: Object properties must be enclosed in double quotes.';
  }
  return errorMessage;
}

export function validateJson(input: string): JsonData {
  if (!input.trim()) {
    return {
      value: null,
      isValid: false,
      error: 'JSON input is empty',
    };
  }

  try {
    const parsed = JSON.parse(input);
    return {
      value: parsed,
      isValid: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON';
    const errorLocation = extractErrorLocation(errorMessage, input);

    return {
      value: null,
      isValid: false,
      error: formatErrorMessage(errorMessage),
      errorLocation,
    };
  }
}

// Tree building utilities
function getValueType(value: any): TreeNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'null';
}

export function buildTree(
  data: any,
  path: string[] = [],
  key: string | number = 'root'
): TreeNode {
  const type = getValueType(data);

  const node: TreeNode = {
    key,
    value: data,
    type,
    path,
    isExpanded: path.length < 2, // Auto-expand first two levels
    children: undefined,
  };

  if (type === 'object' && data !== null) {
    node.children = Object.keys(data).map(childKey =>
      buildTree(data[childKey], [...path, childKey], childKey)
    );
  } else if (type === 'array') {
    node.children = data.map((item: any, index: number) =>
      buildTree(item, [...path, index.toString()], index)
    );
  }

  return node;
}

export function updateNodeValue(
  tree: TreeNode,
  targetPath: string[],
  newValue: any
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
        return updateNodeValue(child, remainingPath, newValue);
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

export function getPathString(path: string[]): string {
  return path.join('.');
}

export function expandAllNodes(node: TreeNode): TreeNode {
  const updatedNode = { ...node, isExpanded: true };

  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(child =>
      expandAllNodes(child)
    );
  }

  return updatedNode;
}

export function collapseAllNodes(node: TreeNode): TreeNode {
  const updatedNode = { ...node, isExpanded: false };

  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(child =>
      collapseAllNodes(child)
    );
  }

  return updatedNode;
}

export function toggleNodeExpansion(
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
        return toggleNodeExpansion(child, remainingPath);
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
