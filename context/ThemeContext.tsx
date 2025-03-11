import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  followSystem: boolean;
  toggleTheme: () => void;
  toggleFollowSystem: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = Appearance.getColorScheme() || 'light';
  const [theme, setTheme] = useState<Theme>(systemTheme);
  const [followSystem, setFollowSystem] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('appTheme');
      const storedFollowSystem = await AsyncStorage.getItem('followSystem');

      if (storedFollowSystem !== null) {
        setFollowSystem(storedFollowSystem === 'true');
      }

      if (storedTheme && storedFollowSystem === 'false') {
        setTheme(storedTheme as Theme);
      } else {
        setTheme(systemTheme);
      }
    };

    loadTheme();
  }, []);

  // 🔥 Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (followSystem) {
        setTheme(colorScheme as Theme);
      }
    });

    return () => subscription.remove();
  }, [followSystem]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setFollowSystem(false);
    await AsyncStorage.setItem('appTheme', newTheme);
    await AsyncStorage.setItem('followSystem', 'false');
  };

  const toggleFollowSystem = async () => {
    const newFollowSystem = !followSystem;
    setFollowSystem(newFollowSystem);
    await AsyncStorage.setItem('followSystem', newFollowSystem.toString());

    if (newFollowSystem) {
      const systemTheme = Appearance.getColorScheme() || 'light';
      setTheme(systemTheme);
      await AsyncStorage.setItem('appTheme', systemTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, followSystem, toggleTheme, toggleFollowSystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
