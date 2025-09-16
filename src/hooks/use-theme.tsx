
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = {
  primary: string; // hex color
  primaryHsl: string;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const defaultTheme: Theme = {
    primary: '#facc15', // Corresponds to yellow-400
    primaryHsl: '45 95% 51%',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    try {
      const item = window.localStorage.getItem('app-theme');
      return item ? JSON.parse(item) : defaultTheme;
    } catch (error) {
      console.error(error);
      return defaultTheme;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('app-theme', JSON.stringify(theme));
      // Update CSS variables
      const root = window.document.documentElement;
      root.style.setProperty('--primary', theme.primaryHsl);
      root.style.setProperty('--ring', theme.primaryHsl);

    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
