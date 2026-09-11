export type CyberThemeId = 'cyan' | 'red' | 'green' | 'purple' | 'amber';

export interface CyberTheme {
  id: CyberThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  primaryRgb: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  glowShadow: string;
  iconBg: string;
}

export const CYBER_THEMES: Record<CyberThemeId, CyberTheme> = {
  cyan: {
    id: 'cyan',
    name: 'Cian Neón',
    tagline: 'Cyberpunk Original',
    primaryColor: '#22d3ee',
    primaryRgb: '34, 211, 238',
    borderClass: 'border-cyan-400',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500',
    glowShadow: '0 0 25px rgba(34, 211, 238, 0.55)',
    iconBg: '#22d3ee'
  },
  red: {
    id: 'red',
    name: 'Rojo Fuego',
    tagline: 'Free Fire Insano',
    primaryColor: '#ef4444',
    primaryRgb: '239, 68, 68',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500',
    glowShadow: '0 0 25px rgba(239, 68, 68, 0.55)',
    iconBg: '#ef4444'
  },
  green: {
    id: 'green',
    name: 'Verde Matrix',
    tagline: 'Hacker Terminal',
    primaryColor: '#22c55e',
    primaryRgb: '34, 197, 94',
    borderClass: 'border-green-400',
    textClass: 'text-green-400',
    bgClass: 'bg-green-500',
    glowShadow: '0 0 25px rgba(34, 197, 94, 0.55)',
    iconBg: '#22c55e'
  },
  purple: {
    id: 'purple',
    name: 'Púrpura VIP',
    tagline: 'Neon Vaporwave',
    primaryColor: '#c084fc',
    primaryRgb: '192, 132, 252',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-500',
    glowShadow: '0 0 25px rgba(192, 132, 252, 0.55)',
    iconBg: '#c084fc'
  },
  amber: {
    id: 'amber',
    name: 'Ámbar Oro',
    tagline: 'Legendary Master',
    primaryColor: '#fbbf24',
    primaryRgb: '251, 191, 36',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
    glowShadow: '0 0 25px rgba(251, 191, 36, 0.55)',
    iconBg: '#fbbf24'
  }
};

const THEME_STORAGE_KEY = 'mundo_mobilador_active_theme';

export function getInitialTheme(): CyberThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as CyberThemeId;
    if (saved && CYBER_THEMES[saved]) return saved;
  } catch {}
  return 'cyan';
}

export function applyTheme(themeId: CyberThemeId) {
  const theme = CYBER_THEMES[themeId] || CYBER_THEMES.cyan;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {}

  const root = document.documentElement;
  root.style.setProperty('--theme-accent', theme.primaryColor);
  root.style.setProperty('--theme-accent-rgb', theme.primaryRgb);
  root.style.setProperty('--theme-accent-glow', theme.glowShadow);
  root.setAttribute('data-theme', themeId);
}
