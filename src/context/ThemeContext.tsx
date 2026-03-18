import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDark: boolean;
  Colors: any;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  Colors: {},
});

const darkColors = {
  background: '#0a0a0c',
  surface: '#121216',
  surfaceHover: '#1a1a20',
  primary: '#2563eb',
  accent: '#a855f7',
  text: '#ffffff',
  textMuted: '#9ca3af',
  border: '#27272a',
};

const lightColors = {
  background: '#F4F4F5',
  surface: '#ffffff',
  surfaceHover: '#f4f4f5',
  primary: '#2563eb',
  accent: '#a855f7',
  text: '#18181B',
  textMuted: '#71717A',
  border: 'rgba(0,0,0,0.05)',
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useAuth();
  const [isDark, setIsDark] = useState(userData?.theme !== 'light');

  useEffect(() => {
    if (userData?.theme) {
      setIsDark(userData.theme !== 'light');
    }
  }, [userData?.theme]);

  const Colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, Colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
