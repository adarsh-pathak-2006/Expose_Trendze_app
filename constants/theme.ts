export const COLORS = {
  primary: '#FFFFFF',
  primaryStrong: '#222D35',
  accent: '#C3002F',
  accentDark: '#B5002C',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F8F8',
  cream: '#FFF6F7',
  white: '#FFFFFF',
  textPrimary: '#222D35',
  textSecondary: '#555C63',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
  border: 'rgba(34, 45, 53, 0.10)',
  divider: 'rgba(34, 45, 53, 0.10)',
  shadow: 'rgba(34, 45, 53, 0.12)',
  overlay: 'rgba(34, 45, 53, 0.82)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  full: 9999,
} as const;

export const FONTS = {
  heading: 'Rubik_700Bold',
  body: 'Rubik_400Regular',
  bodyMedium: 'Rubik_500Medium',
  bodySemiBold: 'Rubik_500Medium',
  bodyBold: 'Rubik_700Bold',
  mono: 'Courier New',
} as const;

export const SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.18,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
} as const;
