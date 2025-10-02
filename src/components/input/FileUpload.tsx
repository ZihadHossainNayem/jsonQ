'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useJsonContext } from '@/components/providers/JsonContextProvider';

interface FileUploadProps {
  className?: string;
  maxSize?: number; // in bytes, default 10MB
  accept?: string;
  disabled?: boolean;
}

interface UploadError {
  type: 'size' | 'type' | 'read' | 'parse';
  message: string;
}

export function FileUpload({
  className = '',
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = '.json,application/json',
  disabled = false,
}: FileUploadProps) {
  const { setJson } = useJsonContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before processing
  const validateFile = useCallback(
    (file: File): UploadError | null => {
      // Check file size
      if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
          type: 'size',
          message: `File size exceeds ${sizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        };
      }

      // Check file type
      const isJsonFile =
        file.type === 'application/json' ||
        file.name.toLowerCase().endsWith('.json');

      if (!isJsonFile) {
        return {
          type: 'type',
          message: 'Please select a valid JSON file (.json extension)',
        };
      }

      return null;
    },
    [maxSize]
  );

  // Process uploaded file
  const processFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          return;
        }

        // Read file content
        const content = await readFileContent(file);

        // Validate JSON content
        try {
          JSON.parse(content);
        } catch {
          setUploadError({
            type: 'parse',
            message: 'File contains invalid JSON syntax',
          });
          return;
        }

        // Success - update JSON context
        setJson(content);
        setUploadSuccess(`Successfully loaded ${file.name}`);

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(null), 3000);
      } catch {
        setUploadError({
          type: 'read',
          message: 'Failed to read file content',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, setJson]
  );

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };

      reader.readAsText(file);
    });
  };

  // Handle file input change
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    },
    [processFile]
  );

  // Handle drag events
  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Clear error message
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Clear success message
  const clearSuccess = useCallback(() => {
    setUploadSuccess(null);
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          transition-all duration-200 cursor-pointer
          ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
              : isDragOver
                ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-label='Upload JSON file'
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          onChange={handleFileChange}
          className='hidden'
          disabled={disabled}
          aria-hidden='true'
        />

        <div className='flex flex-col items-center justify-center space-y-3'>
          {isUploading ? (
            <>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Processing file...
              </p>
            </>
          ) : (
            <>
              <div
                className={`
                p-3 rounded-full
                ${
                  disabled
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : isDragOver
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                }
              `}
              >
                {isDragOver ? (
                  <File className='w-6 h-6 text-blue-500' />
                ) : (
                  <Upload
                    className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}
                  />
                )}
              </div>

              <div className='text-center'>
                <p
                  className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {isDragOver
                    ? 'Drop your JSON file here'
                    : 'Click to upload or drag and drop'}
                </p>
                <p
                  className={`text-xs mt-1 ${disabled ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  JSON files only, max {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className='flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-red-800 dark:text-red-200'>
              Upload Failed
            </p>
            <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
              {uploadError.message}
            </p>
          </div>
          <button
            onClick={clearError}
            className='text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors'
            aria-label='Dismiss error'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className='flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800'>
          <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-green-800 dark:text-green-200'>
              File Uploaded Successfully
            </p>
            <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
              {uploadSuccess}
            </p>
          </div>
          <button
            onClick={clearSuccess}
            className='text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300 transition-colors'
            aria-label='Dismiss success message'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      )}
    </div>
  );
}
