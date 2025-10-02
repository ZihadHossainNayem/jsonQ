import { JsonData } from '@/types/json';

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

export function getPathString(path: string[]): string {
  return path.join('.');
}
