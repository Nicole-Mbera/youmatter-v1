// You Matter Design Tokens
// Calming, warm, trustworthy palette (all green – no blue to keep the interface grounded)

export const youMatterColors = {
  // Primary - Sage Green (calming, growth, healing)
  primary: {
    50: '#f3f6f4',
    100: '#e1e9e4',
    200: '#c7d5ca',
    300: '#a8bfad',
    400: '#8ab08f',
    500: '#6a9970', // Main sage
    600: '#558159',
    700: '#456846',
    800: '#3a5438',
    900: '#314330',
  },

  // Secondary - Sage green variation (complementary tone for depth)
  secondary: {
    50: '#e9f5ea',
    100: '#d6ead4',
    200: '#b3dcb0',
    300: '#8fcf8c',
    400: '#6ccb70',
    500: '#5aa85c', // Secondary green
    600: '#4b9250',
    700: '#3c7b44',
    800: '#2f6438',
    900: '#254f2d',
  },

  // Neutral - Off-white & Grays (background, text)
  neutral: {
    0: '#ffffff',
    50: '#faf9f7', // Off-white
    100: '#f3f1ee',
    200: '#e8e5e0',
    300: '#d9d5ce',
    400: '#c0bab2',
    500: '#a8a09a',
    600: '#8f8681',
    700: '#6f6662',
    800: '#4a4440',
    900: '#2a2420',
  },

  // Semantic
  success: '#7fb069', // Warm green
  warning: '#d9a574', // Warm orange
  error: '#c9726d', // Soft red
  info: '#5e7fa8', // Muted blue
  calm: '#8ab08f', // Calming sage

  // Special
  accent: '#8ab08f', // Sage accent
  softShadow: 'rgba(54, 84, 72, 0.08)', // Sage-tinted shadow
};

export const youMatterSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
};

export const youMatterRadius = {
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  full: '9999px',
};

export const youMatterShadows = {
  none: 'none',
  soft: '0 4px 12px rgba(54, 84, 72, 0.08)',
  medium: '0 8px 24px rgba(54, 84, 72, 0.12)',
  lg: '0 12px 32px rgba(54, 84, 72, 0.15)',
  xl: '0 20px 48px rgba(54, 84, 72, 0.18)',
  inner: 'inset 0 2px 4px rgba(54, 84, 72, 0.06)',
};

export const youMatterTypography = {
  // Headlines
  h1: {
    fontSize: '3rem', // 48px
    fontWeight: '700',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.25rem', // 36px
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: '600',
    lineHeight: '1.3',
  },
  h4: {
    fontSize: '1.5rem', // 24px
    fontWeight: '600',
    lineHeight: '1.4',
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: '600',
    lineHeight: '1.4',
  },
  h6: {
    fontSize: '1rem', // 16px
    fontWeight: '600',
    lineHeight: '1.5',
  },

  // Body
  body: {
    lg: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
    },
    md: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
    },
    xs: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
    },
  },

  // Special
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0.01em',
  },
};

export const youMatterTransitions = {
  fast: 'all 0.15s ease-in-out',
  base: 'all 0.25s ease-in-out',
  slow: 'all 0.35s ease-in-out',
};

export const youMatterBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultraWide: '1536px',
};
