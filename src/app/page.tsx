'use client';

import { JsonInput } from '@/components/input';
import { useJsonContext } from '@/components/providers/JsonContextProvider';
import {
  FileText,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Braces,
} from 'lucide-react';

export default function Home() {
  const { state } = useJsonContext();

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <header className='mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-white mb-2'>
            JSON Formatter
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Validate and format JSON data
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Input Section */}
          <div className='space-y-4'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Input
            </h2>

            <JsonInput />

            {/* Validation Status */}
            {state.rawInput && (
              <div
                className={`p-4 rounded-lg border ${
                  state.jsonData.isValid
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
                }`}
              >
                {state.jsonData.isValid ? (
                  <div className='flex items-center gap-2 text-green-800 dark:text-green-200'>
                    <CheckCircle className='w-4 h-4' />
                    <span className='font-medium'>Valid JSON</span>
                  </div>
                ) : (
                  <div className='text-red-800 dark:text-red-200'>
                    <div className='flex items-center gap-2 mb-2'>
                      <XCircle className='w-4 h-4' />
                      <span className='font-medium'>Invalid JSON</span>
                    </div>
                    <p className='text-sm text-red-700 dark:text-red-300'>
                      {state.jsonData.error}
                    </p>
                    {state.jsonData.errorLocation && (
                      <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                        Line {state.jsonData.errorLocation.line}, Column{' '}
                        {state.jsonData.errorLocation.column}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className='space-y-4'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Preview
            </h2>

            <div className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[400px] overflow-hidden'>
              {state.jsonData.isValid && state.jsonData.value ? (
                <div className='p-4'>
                  <pre className='text-sm text-gray-800 dark:text-gray-200 overflow-auto font-mono'>
                    {JSON.stringify(state.jsonData.value, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-full py-16 text-center'>
                  <FileText className='w-12 h-12 text-gray-400 dark:text-gray-500 mb-3' />
                  <p className='text-gray-500 dark:text-gray-400 text-sm'>
                    {state.rawInput
                      ? 'Fix JSON errors to see preview'
                      : 'Enter JSON to see formatted output'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
