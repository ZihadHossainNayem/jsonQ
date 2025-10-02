'use client';

import React, { useState } from 'react';
import { Download, FileDown, AlertCircle, Check } from 'lucide-react';

interface DownloadButtonProps {
  data: unknown;
  filename?: string;
  format?: 'json' | 'formatted';
  includeTimestamp?: boolean;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function DownloadButton({
  data,
  filename = 'data',
  format = 'formatted',
  includeTimestamp = true,
  label,
  className = '',
  size = 'md',
  variant = 'secondary',
}: DownloadButtonProps) {
  const [downloadState, setDownloadState] = useState<
    'idle' | 'downloading' | 'success' | 'error'
  >('idle');

  const generateFilename = () => {
    const baseFilename = filename.replace(/\.json$/, '');
    const timestamp = includeTimestamp
      ? `_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`
      : '';
    return `${baseFilename}${timestamp}.json`;
  };

  const handleDownload = async () => {
    try {
      setDownloadState('downloading');

      let jsonString: string;
      if (typeof data === 'string') {
        jsonString = data;
      } else {
        jsonString =
          format === 'json'
            ? JSON.stringify(data)
            : JSON.stringify(data, null, 2);
      }

      // Create blob
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename();

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadState('success');
      setTimeout(() => setDownloadState('idle'), 2000);
    } catch (error) {
      console.error('Failed to download file:', error);
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 3000);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-blue-500 dark:hover:bg-blue-600
          focus:ring-blue-500
        `;
      case 'ghost':
        return `
          bg-transparent hover:bg-gray-100 text-gray-600
          dark:hover:bg-gray-800 dark:text-gray-400
          focus:ring-gray-500
        `;
      default:
        return `
          bg-gray-100 hover:bg-gray-200 text-gray-700
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300
          focus:ring-gray-500
        `;
    }
  };

  const getIcon = () => {
    const iconSize =
      size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    switch (downloadState) {
      case 'downloading':
        return <Download className={`${iconSize} animate-bounce`} />;
      case 'success':
        return (
          <Check className={`${iconSize} text-green-600 dark:text-green-400`} />
        );
      case 'error':
        return (
          <AlertCircle
            className={`${iconSize} text-red-600 dark:text-red-400`}
          />
        );
      default:
        return <FileDown className={iconSize} />;
    }
  };

  const getButtonText = () => {
    if (label) return label;

    switch (downloadState) {
      case 'downloading':
        return 'Downloading...';
      case 'success':
        return 'Downloaded!';
      case 'error':
        return 'Failed';
      default:
        return 'Download';
    }
  };

  const getTitle = () => {
    switch (downloadState) {
      case 'downloading':
        return 'Preparing download...';
      case 'success':
        return 'File downloaded successfully';
      case 'error':
        return 'Failed to download file';
      default:
        return `Download as ${generateFilename()}`;
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloadState === 'downloading'}
      className={`
        inline-flex items-center gap-2 rounded-md font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
      {(label || size !== 'sm') && (
        <span
          className={
            downloadState === 'success'
              ? 'text-green-600 dark:text-green-400'
              : ''
          }
        >
          {getButtonText()}
        </span>
      )}
    </button>
  );
}

// Specialized download buttons for common use cases
export function DownloadJsonButton({
  data,
  filename,
  className = '',
}: {
  data: unknown;
  filename?: string;
  className?: string;
}) {
  return (
    <DownloadButton
      data={data}
      filename={filename}
      format='formatted'
      label='Download JSON'
      variant='secondary'
      className={className}
    />
  );
}

export function DownloadMinifiedButton({
  data,
  filename,
  className = '',
}: {
  data: unknown;
  filename?: string;
  className?: string;
}) {
  return (
    <DownloadButton
      data={data}
      filename={filename}
      format='json'
      label='Download Minified'
      variant='ghost'
      size='sm'
      className={className}
    />
  );
}

export function DownloadIconButton({
  data,
  filename,
  className = '',
}: {
  data: unknown;
  filename?: string;
  className?: string;
}) {
  return (
    <DownloadButton
      data={data}
      filename={filename}
      format='formatted'
      variant='ghost'
      size='sm'
      className={className}
    />
  );
}
