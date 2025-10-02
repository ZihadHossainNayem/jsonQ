'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'dropdown' | 'cycle';
  showLabel?: boolean;
}

export function ThemeToggle({
  className = '',
  size = 'md',
  variant = 'cycle',
  showLabel = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    updateResolvedTheme(savedTheme || 'system');
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateResolvedTheme = (newTheme: Theme) => {
    let resolved: 'light' | 'dark';

    if (newTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolved = newTheme;
    }

    setResolvedTheme(resolved);

    // Apply theme to document
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setIsTransitioning(true);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateResolvedTheme(newTheme);

    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 300);

    if (variant === 'dropdown') {
      setIsDropdownOpen(false);
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1.5';
      case 'lg':
        return 'p-3';
      default:
        return 'p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getThemeIcon = (themeType: Theme, isActive = false) => {
    const iconSize = getIconSize();
    const activeClass = isActive ? 'text-blue-600 dark:text-blue-400' : '';

    switch (themeType) {
      case 'light':
        return (
          <Sun
            className={`${iconSize} ${activeClass} ${isTransitioning ? 'animate-spin' : ''}`}
          />
        );
      case 'dark':
        return (
          <Moon
            className={`${iconSize} ${activeClass} ${isTransitioning ? 'animate-pulse' : ''}`}
          />
        );
      case 'system':
        return <Monitor className={`${iconSize} ${activeClass}`} />;
      default:
        return <Palette className={iconSize} />;
    }
  };

  const getThemeLabel = (themeType: Theme) => {
    switch (themeType) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Theme';
    }
  };

  const buttonBaseClasses = `
    rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    text-gray-600 dark:text-gray-400
    hover:text-gray-800 dark:hover:text-gray-200
    hover:bg-gray-100 dark:hover:bg-gray-700
    ${getSizeClasses()}
  `;

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={buttonBaseClasses}
          title={`Current theme: ${getThemeLabel(theme)}`}
          aria-label='Toggle theme menu'
          aria-expanded={isDropdownOpen}
        >
          <div className='flex items-center gap-2'>
            {getThemeIcon(theme, true)}
            {showLabel && (
              <span className='text-sm'>{getThemeLabel(theme)}</span>
            )}
          </div>
        </button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown menu */}
            <div className='absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20'>
              <div className='py-1'>
                {(['light', 'dark', 'system'] as Theme[]).map(themeOption => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${
                        theme === themeOption
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {getThemeIcon(themeOption, theme === themeOption)}
                    <span>{getThemeLabel(themeOption)}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`inline-flex rounded-md shadow-sm ${className}`}>
        {(['light', 'dark', 'system'] as Theme[]).map((themeOption, index) => (
          <button
            key={themeOption}
            onClick={() => handleThemeChange(themeOption)}
            className={`
              ${buttonBaseClasses}
              ${index === 0 ? 'rounded-r-none' : index === 2 ? 'rounded-l-none' : 'rounded-none'}
              ${index > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}
              ${
                theme === themeOption
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : ''
              }
            `}
            title={`Switch to ${getThemeLabel(themeOption)} theme`}
            aria-label={`Switch to ${getThemeLabel(themeOption)} theme`}
          >
            {getThemeIcon(themeOption, theme === themeOption)}
            {showLabel && (
              <span className='ml-1 text-xs'>{getThemeLabel(themeOption)}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default: cycle variant
  return (
    <button
      onClick={cycleTheme}
      className={`${buttonBaseClasses} ${className}`}
      title={`Current: ${getThemeLabel(theme)} (${resolvedTheme}). Click to cycle themes.`}
      aria-label={`Current theme: ${getThemeLabel(theme)}. Click to cycle themes.`}
    >
      <div className='flex items-center gap-2'>
        {getThemeIcon(theme, true)}
        {showLabel && <span className='text-sm'>{getThemeLabel(theme)}</span>}
      </div>
    </button>
  );
}

// Specialized theme toggle components
export function SimpleThemeToggle({ className = '' }: { className?: string }) {
  return <ThemeToggle variant='cycle' size='md' className={className} />;
}

export function ThemeDropdown({ className = '' }: { className?: string }) {
  return (
    <ThemeToggle
      variant='dropdown'
      size='md'
      showLabel={true}
      className={className}
    />
  );
}

export function ThemeButtonGroup({ className = '' }: { className?: string }) {
  return <ThemeToggle variant='button' size='sm' className={className} />;
}
