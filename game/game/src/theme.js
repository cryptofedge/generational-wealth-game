/**
 * theme.js â Generational Wealth Game visual design system
 * Dark background, orange/gold gamified aesthetic
 */

export const COLORS = {
  // Backgrounds
  bg: '#0A0A0A',
  surface: '#111111',
  card: '#161616',
  cardBorder: '#2A2A2A',
  modal: '#1A1A1A',

  // Brand
  primary: '#FF6B00',      // logo orange
  primaryDark: '#CC5500',
  primaryLight: '#FF8C33',
  gold: '#FFD700',
  goldDark: '#B8960C',
  goldLight: '#FFE566',

  // Status
  green: '#00E676',
  greenDark: '#00A152',
  red: '#FF3D00',
  redDark: '#C62300',
  blue: '#2979FF',
  blueDark: '#0043CA',
  purple: '#AA00FF',

  // Text
  text: '#FFFFFF',
  textSecondary: '#BBBBBB',
  textMuted: '#666666',
  textDisabled: '#444444',
};

export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  hero: 48,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Gradient presets
export const GRADIENTS = {
  primary: ['#FF6B00', '#CC4400'],
  gold: ['#FFD700', '#FF8C00'],
  dark: ['#1A1A1A', '#0A0A0A'],
  success: ['#00E676', '#00A152'],
  card: ['#1E1E1E', '#141414'],
  hero: ['#FF6B00', '#8B0000'],
};

// XP level thresholds
export const LEVELS = [
  { level: 1,  xpRequired: 0,     title: 'Borrower' },
  { level: 2,  xpRequired: 1000,  title: 'Saver' },
  { level: 3,  xpRequired: 2500,  title: 'Investor' },
  { level: 4,  xpRequired: 5000,  title: 'Policy Holder' },
  { level: 5,  xpRequired: 8000,  title: 'IBC Practitioner' },
  { level: 6,  xpRequired: 12000, title: 'Wealth Builder' },
  { level: 7,  xpRequired: 17000, title: 'Legacy Planner' },
  { level: 8,  xpRequired: 23000, title: 'Family Banker' },
  { level: 9,  xpRequired: 30000, title: 'Infinite Banker' },
  { level: 10, xpRequired: 40000, title: 'Generational Legend' },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = next
    ? (xp - current.xpRequired) / (next.xpRequired - current.xpRequired)
    : 1;
  return { current, next, progress };
}
