export const Colors = {
  background: '#FFFFFF', // Pure white core
  softBg: '#F8F7FF', // Deeper lavender-tinted background
  surface: '#FFFFFF',
  primary: '#5B4FE1', // More vibrant, slightly deeper primary
  primaryLight: '#EEEDFF', // Active highlights
  accent: '#7C3AED', // Royal Purple accent
  text: '#0F172A', // Slate 900 for modern feel
  textSecondary: '#475569', // Slate 600
  textTertiary: '#94A3B8', // Slate 400
  border: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  teal: '#14B8A6', // Refined teal
  softPink: '#FFF1F2', // Rose 50
  lavender: '#F5F3FF', // Violet 50
  white: '#FFFFFF',
  cardShadow: 'rgba(91, 79, 225, 0.08)',
};

export const Sizes = {
  radiusFull: 99,
  radiusLg: 32,
  radiusMd: 20, // Increased for softer feel
  radiusSm: 12, // Increased for softer feel
  padding: 24,
  gap: 16,
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, // Subtler
    shadowRadius: 16,
    elevation: 2,
  },
  medium: {
    shadowColor: '#5B4FE1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1, // Stronger but refined
    shadowRadius: 24,
    elevation: 10,
  },
  premium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 15,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};
