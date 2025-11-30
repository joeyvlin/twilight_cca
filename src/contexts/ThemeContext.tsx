import { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'ice' | 'fire';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: {
    accent: string;
    accentLight: string;
    accentDark: string;
    accentHover: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColors = {
  ice: {
    accent: 'cyan-400',
    accentLight: 'cyan-300',
    accentDark: 'cyan-500',
    accentHover: 'cyan-300',
  },
  fire: {
    accent: 'red-500',
    accentLight: 'red-400',
    accentDark: 'red-600',
    accentHover: 'red-600',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('ice');

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
