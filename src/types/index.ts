// Core JSON data types
export interface JsonData {
  value: any;
  isValid: boolean;
  error?: string;
  errorLocation?: { line: number; column: number };
}

// Tree node structure for JSON visualization
export interface TreeNode {
  key: string | number;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string[];
  isExpanded: boolean;
  children?: TreeNode[];
  parent?: TreeNode;
}

// Application theme types
export type Theme = 'light' | 'dark';

// View mode types
export type ViewMode = 'tree' | 'raw';

// Application state interface
export interface AppState {
  jsonData: JsonData;
  treeData: TreeNode | null;
  theme: Theme;
  expandedNodes: Set<string>;
  editingNode: string | null;
  searchQuery: string;
  viewMode: ViewMode;
}

// JSON validation error types
export interface JsonError {
  type: 'syntax' | 'structure' | 'size' | 'network';
  message: string;
  location?: { line: number; column: number };
  suggestion?: string;
}

// Context action types for state management
export type JsonAction =
  | { type: 'SET_JSON'; payload: string }
  | { type: 'VALIDATE_JSON' }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'START_EDITING'; payload: string }
  | { type: 'SAVE_EDIT'; payload: { path: string; value: any } }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };

// Theme context interface
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// JSON context interface
export interface JsonContextType {
  state: AppState;
  dispatch: React.Dispatch<JsonAction>;
}

// Component prop interfaces
export interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export interface ValidationDisplayProps {
  error?: string;
  isValid: boolean;
  errorLocation?: { line: number; column: number };
}

export interface JsonTreeProps {
  data: TreeNode | null;
  onNodeToggle: (path: string) => void;
  onNodeEdit: (path: string, value: any) => void;
  searchQuery?: string;
  className?: string;
}

export interface JsonNodeProps {
  node: TreeNode;
  onToggle: (path: string) => void;
  onEdit: (path: string, value: any) => void;
  isSearchMatch?: boolean;
  level?: number;
}

// Utility types
export interface CopyOptions {
  format: 'minified' | 'formatted';
  includeMetadata?: boolean;
}

export interface DownloadOptions {
  filename?: string;
  format: 'json' | 'formatted';
  timestamp?: boolean;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  searchKeys?: boolean;
  searchValues?: boolean;
}

// Virtual scrolling types for performance
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

export interface VirtualScrollState {
  scrollTop: number;
  visibleStart: number;
  visibleEnd: number;
}
