// src/theme/index.js

export const COLORS = {
  primary: '#0066FF',
  primaryDark: '#0047CC',
  primaryLight: '#E6F0FF',
  secondary: '#00C896',
  secondaryLight: '#E6FBF5',
  accent: '#FF6B35',
  warning: '#FFB800',
  danger: '#FF3B3B',
  success: '#00C896',

  dark: '#0A0F1E',
  darkAlt: '#121826',
  card: '#1A2236',

  white: '#FFFFFF',
  gray100: '#F5F7FA',
  gray200: '#E8ECF4',
  gray300: '#C5CEDB',
  gray400: '#8A97B0',
  gray500: '#5C6E8A',
  gray600: '#3D4F6E',

  text: '#0A0F1E',
  textSecondary: '#5C6E8A',
  textLight: '#8A97B0',
  textWhite: '#FFFFFF',

  background: '#F5F7FA',
  backgroundDark: '#0A0F1E',
  border: '#E8ECF4',
};

export const GRADIENTS = {
  primary: ['#0066FF', '#0047CC'],
  secondary: ['#00C896', '#009B73'],
  accent: ['#FF6B35', '#E54E1B'],
  dark: ['#0A0F1E', '#1A2236'],
  card: ['#1A2236', '#121826'],
  pulsa: ['#0066FF', '#00A8FF'],
  internet: ['#7C3AED', '#9F67FF'],
  ewallet: ['#00C896', '#009B73'],
  pln: ['#FF8C00', '#FFB800'],
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semiBold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  extraBold: { fontFamily: 'System', fontWeight: '800' },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
};
