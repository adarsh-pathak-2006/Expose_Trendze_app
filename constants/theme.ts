export const COLORS = {
  primary: '#1A1A2E',
  accent: '#C8973A',
  surface: '#2C2C54',
  cream: '#F9F6EE',
  white: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
  border: 'rgba(200, 151, 58, 0.22)',
  divider: 'rgba(255, 255, 255, 0.08)',
  shadow: 'rgba(200, 151, 58, 0.18)',
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
  lg: 20,
  full: 9999,
} as const;

export const FONTS = {
  heading: 'PlayfairDisplay_700Bold',
  body: 'Montserrat_400Regular',
  bodyMedium: 'Montserrat_500Medium',
  bodySemiBold: 'Montserrat_600SemiBold',
  bodyBold: 'Montserrat_700Bold',
  mono: 'Courier New',
} as const;

export const SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.2,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
} as const;
