/**
 * Theme Provider
 * Provides theme context and handles system theme changes
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useAppSelector } from "../store/hooks";
import { selectDisplayPreferences } from "../store/slices/preferencesSlice";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof lightColors;
}

const lightColors = {
  // Primary colors
  primary: "#2E7D32",
  primaryVariant: "#1B5E20",
  secondary: "#4CAF50",
  secondaryVariant: "#388E3C",

  // Background colors
  background: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",

  // Text colors
  text: "#212121",
  textSecondary: "#757575",
  textOnPrimary: "#FFFFFF",

  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",

  // UI colors
  border: "#E0E0E0",
  disabled: "#BDBDBD",
  placeholder: "#9E9E9E",

  // Polo-specific colors
  field: "#8BC34A",
  chukker: "#FF6B35",
  goal: "#FFC107",
};

const darkColors = {
  // Primary colors
  primary: "#4CAF50",
  primaryVariant: "#66BB6A",
  secondary: "#81C784",
  secondaryVariant: "#A5D6A7",

  // Background colors
  background: "#121212",
  surface: "#1E1E1E",
  card: "#2C2C2C",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textOnPrimary: "#000000",

  // Status colors
  success: "#66BB6A",
  warning: "#FFB74D",
  error: "#EF5350",
  info: "#42A5F5",

  // UI colors
  border: "#404040",
  disabled: "#616161",
  placeholder: "#757575",

  // Polo-specific colors
  field: "#9CCC65",
  chukker: "#FF8A65",
  goal: "#FFD54F",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false,
  colors: lightColors,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const displayPrefs = useAppSelector(selectDisplayPreferences);
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Determine the actual theme to use
  const getTheme = (): Theme => {
    if (displayPrefs.theme === "system") {
      return systemTheme === "dark" ? "dark" : "light";
    }
    return displayPrefs.theme;
  };

  const theme = getTheme();
  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    theme,
    isDark,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
