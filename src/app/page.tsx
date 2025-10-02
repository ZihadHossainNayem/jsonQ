'use client';

import { JsonInput, FileUpload, ValidationDisplay } from '@/components/input';
import { JsonTree } from '@/components/tree';
import {
  CopyJsonButton,
  DownloadJsonButton,
  SimpleThemeToggle,
} from '@/components/controls';
import { ToastProvider } from '@/components/ui';
import { useJsonContext } from '@/components/providers/JsonContextProvider';
import { FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const {
    state,
    toggleNode,
    saveEdit,
    expandAll,
    collapseAll,
    setSearchQuery,
  } = useJsonContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        {/* Mobile header */}
        <div className='lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
              JSON Formatter
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <SimpleThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>

        <div className='p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Desktop header */}
            <header className='hidden lg:flex items-center justify-between mb-8'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                  JSON Formatter & Viewer
                </h1>
                <p className='text-lg text-gray-600 dark:text-gray-400'>
                  Validate, format, and explore JSON data with an interactive
                  tree view
                </p>
              </div>
              <SimpleThemeToggle />
            </header>

            {/* Main content */}
            <div
              className={`
              grid gap-6 transition-all duration-300
              ${isMobileMenuOpen ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}
              lg:grid-cols-2
            `}
            >
              {/* Input Section */}
              <section
                className={`space-y-4 ${isMobileMenuOpen ? 'order-1' : ''}`}
                aria-labelledby='input-heading'
              >
                <h2
                  id='input-heading'
                  className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'
                >
                  <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  JSON Input
                </h2>

                <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm'>
                  <FileUpload />

                  <div className='relative my-6'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>
                        or paste JSON below
                      </span>
                    </div>
                  </div>

                  <JsonInput />

                  {/* Validation Display */}
                  {state.rawInput && (
                    <div className='mt-4'>
                      <ValidationDisplay
                        error={state.jsonData.error}
                        isValid={state.jsonData.isValid}
                        errorLocation={state.jsonData.errorLocation}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Tree View Section */}
              <section
                className={`space-y-4 ${isMobileMenuOpen ? 'order-2' : ''}`}
                aria-labelledby='tree-heading'
              >
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <h2
                    id='tree-heading'
                    className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'
                  >
                    <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                    Tree View
                  </h2>

                  {/* Action buttons */}
                  {state.jsonData.isValid && state.jsonData.value !== null && (
                    <div className='flex items-center gap-2 flex-wrap'>
                      <CopyJsonButton data={state.jsonData.value} />
                      <DownloadJsonButton
                        data={state.jsonData.value}
                        filename='formatted-json'
                      />
                    </div>
                  )}
                </div>

                <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'>
                  <div className='min-h-[500px] lg:min-h-[600px]'>
                    {state.jsonData.isValid && state.treeData ? (
                      <JsonTree
                        data={state.treeData}
                        onNodeToggle={path => toggleNode(path.join('.'))}
                        onNodeEdit={(path, value) =>
                          saveEdit(path.join('.'), value)
                        }
                        onExpandAll={expandAll}
                        onCollapseAll={collapseAll}
                        searchQuery={state.searchQuery}
                        onSearchChange={setSearchQuery}
                      />
                    ) : (
                      <div className='flex flex-col items-center justify-center h-full py-16 text-center px-4'>
                        <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                          <FileText className='w-8 h-8 text-gray-400 dark:text-gray-500' />
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
                          {state.rawInput ? 'Invalid JSON' : 'No JSON Data'}
                        </h3>
                        <p className='text-gray-500 dark:text-gray-400 text-sm max-w-sm'>
                          {state.rawInput
                            ? 'Please fix the JSON syntax errors to view the tree structure'
                            : 'Upload a file or paste JSON data to get started with the interactive tree view'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
              <div className='text-center text-sm text-gray-500 dark:text-gray-400'>
                <p>
                  Built with React, TypeScript, and Tailwind CSS.
                  <span className='hidden sm:inline'>
                    {' '}
                    Features include real-time validation, tree visualization,
                    and advanced search.
                  </span>
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
