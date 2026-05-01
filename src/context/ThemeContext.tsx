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
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#222222',
  primary: '#8B5CF6',
  accent: '#A78BFA',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: 'rgba(255, 255, 255, 0.1)',
  glass: 'rgba(255, 255, 255, 0.05)',
};

const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  primary: '#8B5CF6',
  accent: '#A78BFA',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  glass: 'rgba(255, 255, 255, 0.8)',
};


export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useAuth();
  const [isDark, setIsDark] = useState(userData?.theme === 'dark');

  useEffect(() => {
    if (userData?.theme) {
      setIsDark(userData.theme === 'dark');
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
