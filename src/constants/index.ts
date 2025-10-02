// Application constants
export const APP_NAME = 'JSON Viewer & Formatter';
export const APP_VERSION = '1.0.0';

// Theme constants
export const THEMES = {
    LIGHT: 'light' as const,
    DARK: 'dark' as const,
};

export const THEME_STORAGE_KEY = 'json-viewer-theme';

// JSON processing constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TREE_NODES = 10000; // For performance optimization
export const VIRTUAL_SCROLL_ITEM_HEIGHT = 24; // pixels
export const VIRTUAL_SCROLL_OVERSCAN = 5; // extra items to render

// JSON type constants
export const JSON_TYPES = {
    OBJECT: 'object' as const,
    ARRAY: 'array' as const,
    STRING: 'string' as const,
    NUMBER: 'number' as const,
    BOOLEAN: 'boolean' as const,
    NULL: 'null' as const,
};

// Error messages
export const ERROR_MESSAGES = {
    INVALID_JSON: 'Invalid JSON syntax',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    UNSUPPORTED_FILE_TYPE: 'Unsupported file type',
    NETWORK_ERROR: 'Network error occurred',
    CLIPBOARD_ERROR: 'Failed to copy to clipboard',
    DOWNLOAD_ERROR: 'Failed to download file',
};

// Success messages
export const SUCCESS_MESSAGES = {
    JSON_COPIED: 'JSON copied to clipboard',
    FILE_DOWNLOADED: 'File downloaded successfully',
    JSON_VALIDATED: 'JSON is valid',
};

// Default values
export const DEFAULT_JSON =
    '{\n  "message": "Welcome to JSON Viewer & Formatter",\n  "features": [\n    "JSON validation",\n    "Tree view",\n    "Syntax highlighting",\n    "Copy & download",\n    "Dark/light theme"\n  ],\n  "version": "1.0.0"\n}';

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
    COPY: 'Ctrl+C',
    PASTE: 'Ctrl+V',
    EXPAND_ALL: 'Ctrl+E',
    COLLAPSE_ALL: 'Ctrl+Shift+E',
    TOGGLE_THEME: 'Ctrl+Shift+T',
    SEARCH: 'Ctrl+F',
};
