export interface JsonData {
  value: any;
  isValid: boolean;
  error?: string;
  errorLocation?: { line: number; column: number };
}

export interface TreeNode {
  key: string | number;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string[];
  isExpanded: boolean;
  children?: TreeNode[];
  parent?: TreeNode;
}

export interface AppState {
  jsonData: JsonData;
  treeData: TreeNode | null;
  expandedNodes: Set<string>;
  editingNode: string | null;
  searchQuery: string;
  viewMode: 'tree' | 'raw';
  rawInput: string;
}

export type JsonAction =
  | { type: 'SET_JSON'; payload: string }
  | { type: 'VALIDATE_JSON' }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'START_EDITING'; payload: string }
  | { type: 'SAVE_EDIT'; payload: { path: string; value: any } }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'tree' | 'raw' }
  | { type: 'CLEAR_JSON' };
