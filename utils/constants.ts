import { Platform } from 'react-native';

export const Fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  // Heavy system sans-serif for feed section headers — X/Twitter-style weight
  header: Platform.select({ ios: undefined, android: 'sans-serif-black' }),
};

// Warm dark theme — inspired by espresso crema on dark slate
export const Colors = {
  primary: '#C8923C',           // crema gold
  background: '#0E0C0A',        // deep warm dark brown
  card: '#1A1614',              // slightly lighter warm brown
  text: '#FFFFFF',              // white
  textSecondary: '#A09888',     // warm gray
  danger: '#E74C3C',
  border: '#2A2218',            // warm dark border
  tabBar: '#0E0C0A',
  tabInactive: '#6B5E52',       // muted warm brown
};

export const AuthColors = {
  background: '#0E0C0A',
  text: '#FFFFFF',
  textSecondary: '#A09888',
  buttonFill: '#C8923C',        // crema gold
  buttonText: '#0E0C0A',        // dark text on gold
  buttonOutline: '#C8923C',
  inputBorder: '#2A2218',
  inputBackground: '#1A1614',
  error: '#E74C3C',
  link: '#C8923C',
};
