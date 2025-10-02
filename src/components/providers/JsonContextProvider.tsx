'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, JsonAction, JsonData, TreeNode } from '@/types/json';
import { validateJson } from '@/utils/jsonUtils';
import {
  buildTreeNode,
  updateTreeNode,
  expandAllTreeNodes,
  collapseAllTreeNodes,
  toggleTreeNodeExpansion,
  collectExpandedPaths,
  collectAllPaths,
  reconstructJsonFromTree,
} from '@/utils/treeUtils';

// Initial state
const initialState: AppState = {
  jsonData: {
    value: null,
    isValid: false,
  },
  treeData: null,
  expandedNodes: new Set<string>(),
  editingNode: null,
  searchQuery: '',
  viewMode: 'tree',
  rawInput: '',
};

// Reducer function
function jsonReducer(state: AppState, action: JsonAction): AppState {
  switch (action.type) {
    case 'SET_JSON': {
      const rawInput = action.payload;
      const jsonData = validateJson(rawInput);

      let treeData: TreeNode | null = null;
      let expandedNodes = new Set<string>();

      if (jsonData.isValid && jsonData.value !== null) {
        treeData = buildTreeNode(jsonData.value);
        // Initialize expanded nodes with auto-expanded paths
        expandedNodes = collectExpandedPaths(treeData);
      }

      return {
        ...state,
        rawInput,
        jsonData,
        treeData,
        expandedNodes,
        editingNode: null, // Clear any active editing when JSON changes
      };
    }

    case 'VALIDATE_JSON': {
      const jsonData = validateJson(state.rawInput);

      let treeData: TreeNode | null = null;
      let expandedNodes = new Set<string>();

      if (jsonData.isValid && jsonData.value !== null) {
        treeData = buildTreeNode(jsonData.value);
        expandedNodes = collectExpandedPaths(treeData);
      }

      return {
        ...state,
        jsonData,
        treeData,
        expandedNodes,
      };
    }

    case 'TOGGLE_NODE': {
      const nodePath = action.payload;

      if (!state.treeData) return state;

      const pathArray = nodePath.split('.').filter(p => p !== '');
      const updatedTree = toggleTreeNodeExpansion(state.treeData, pathArray);
      const updatedExpandedNodes = new Set(state.expandedNodes);

      if (updatedExpandedNodes.has(nodePath)) {
        updatedExpandedNodes.delete(nodePath);
      } else {
        updatedExpandedNodes.add(nodePath);
      }

      return {
        ...state,
        treeData: updatedTree,
        expandedNodes: updatedExpandedNodes,
      };
    }

    case 'EXPAND_ALL': {
      if (!state.treeData) return state;

      const expandedTree = expandAllTreeNodes(state.treeData);
      const allPaths = collectAllPaths(expandedTree);

      return {
        ...state,
        treeData: expandedTree,
        expandedNodes: new Set(allPaths),
      };
    }

    case 'COLLAPSE_ALL': {
      if (!state.treeData) return state;

      const collapsedTree = collapseAllTreeNodes(state.treeData);

      return {
        ...state,
        treeData: collapsedTree,
        expandedNodes: new Set<string>(),
      };
    }

    case 'START_EDITING': {
      return {
        ...state,
        editingNode: action.payload,
      };
    }

    case 'SAVE_EDIT': {
      const { path, value } = action.payload;

      if (!state.treeData) return state;

      try {
        const pathArray = path.split('.').filter(p => p !== '');
        const updatedTree = updateTreeNode(state.treeData, pathArray, value);

        // Update the JSON data with the new tree structure
        const updatedJsonData: JsonData = {
          value: reconstructJsonFromTree(updatedTree),
          isValid: true,
        };

        return {
          ...state,
          treeData: updatedTree,
          jsonData: updatedJsonData,
          editingNode: null,
          rawInput: JSON.stringify(updatedJsonData.value, null, 2),
        };
      } catch (error) {
        // If edit fails, just cancel editing
        return {
          ...state,
          editingNode: null,
        };
      }
    }

    case 'CANCEL_EDIT': {
      return {
        ...state,
        editingNode: null,
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        searchQuery: action.payload,
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.payload,
      };
    }

    case 'CLEAR_JSON': {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}

// Context type
interface JsonContextType {
  state: AppState;
  dispatch: React.Dispatch<JsonAction>;
  // Convenience methods
  setJson: (json: string) => void;
  validateJson: () => void;
  toggleNode: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  startEditing: (path: string) => void;
  saveEdit: (path: string, value: any) => void;
  cancelEdit: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'tree' | 'raw') => void;
  clearJson: () => void;
}

// Create context
const JsonContext = createContext<JsonContextType | undefined>(undefined);

// Provider component
interface JsonContextProviderProps {
  children: ReactNode;
}

export function JsonContextProvider({ children }: JsonContextProviderProps) {
  const [state, dispatch] = useReducer(jsonReducer, initialState);

  // Convenience methods
  const contextValue: JsonContextType = {
    state,
    dispatch,
    setJson: (json: string) => dispatch({ type: 'SET_JSON', payload: json }),
    validateJson: () => dispatch({ type: 'VALIDATE_JSON' }),
    toggleNode: (path: string) =>
      dispatch({ type: 'TOGGLE_NODE', payload: path }),
    expandAll: () => dispatch({ type: 'EXPAND_ALL' }),
    collapseAll: () => dispatch({ type: 'COLLAPSE_ALL' }),
    startEditing: (path: string) =>
      dispatch({ type: 'START_EDITING', payload: path }),
    saveEdit: (path: string, value: any) =>
      dispatch({ type: 'SAVE_EDIT', payload: { path, value } }),
    cancelEdit: () => dispatch({ type: 'CANCEL_EDIT' }),
    setSearchQuery: (query: string) =>
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setViewMode: (mode: 'tree' | 'raw') =>
      dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    clearJson: () => dispatch({ type: 'CLEAR_JSON' }),
  };

  return (
    <JsonContext.Provider value={contextValue}>{children}</JsonContext.Provider>
  );
}

// Custom hook to use the context
export function useJsonContext() {
  const context = useContext(JsonContext);
  if (context === undefined) {
    throw new Error('useJsonContext must be used within a JsonContextProvider');
  }
  return context;
}
