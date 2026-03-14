import { Platform } from 'react-native';

export const Fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  header: Platform.select({ ios: undefined, android: 'sans-serif-black' }),
  // Retro arcade font — used for brand wordmark on auth screens
  retro: 'PressStart2P_400Regular' as const,
};

// Warm dark theme — inspired by espresso crema on dark slate
export const Colors = {
  primary: '#C8923C',           // crema gold
  background: '#0E0C0A',        // deep warm dark brown
  card: '#1A1614',              // slightly lighter warm brown
  text: '#FFFFFF',              // white
  textSecondary: '#C4B8AA',     // warm subtle — aligned with web
  danger: '#C84040',            // dark danger red — aligned with web
  success: '#4A8C5C',           // muted green — aligned with web
  warning: '#C89040',           // warm amber — aligned with web
  border: '#1E1A17',            // warm dark border — aligned with web
  tabBar: '#0E0C0A',
  tabInactive: '#6B5E52',       // muted warm brown
};

export const AuthColors = {
  background: '#0E0C0A',
  text: '#FFFFFF',
  textSecondary: '#C4B8AA',     // aligned with web
  buttonFill: '#C8923C',        // crema gold
  buttonText: '#0E0C0A',        // dark text on gold
  buttonOutline: '#C8923C',
  inputBorder: '#1E1A17',       // aligned with web
  inputBackground: '#0E0C0A',   // aligned with web
  error: '#C84040',             // aligned with web
  link: '#C8923C',
};
