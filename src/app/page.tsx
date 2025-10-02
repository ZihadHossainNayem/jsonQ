'use client';

import { JsonInput, FileUpload, ValidationDisplay } from '@/components/input';
import { useJsonContext } from '@/components/providers/JsonContextProvider';
import { FileText } from 'lucide-react';

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

            <FileUpload />

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300 dark:border-gray-600' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400'>
                  or paste JSON below
                </span>
              </div>
            </div>

            <JsonInput />

            {/* Validation Display */}
            {state.rawInput && (
              <ValidationDisplay
                error={state.jsonData.error}
                isValid={state.jsonData.isValid}
                errorLocation={state.jsonData.errorLocation}
              />
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
