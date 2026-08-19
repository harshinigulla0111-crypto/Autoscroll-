/**
 * AutoScroll Overlay & Glass UI Manager
 * Controls transparency, backdrop blur, typography, and platform themes.
 */

const OVERLAY_CONFIG_KEY = 'autoscroll_overlay_config_v1';

export const THEME_PRESETS = {
  GLASS_DARK: {
    id: 'glass-dark',
    name: 'Glassmorphism Dark',
    bgStyle: 'rgba(10, 15, 30, 0.85)',
    panelBg: 'rgba(17, 24, 39, 0.75)',
    textColor: '#f8fafc',
    textMuted: '#94a3b8',
    accentColor: '#3b82f6',
    blurPx: 16,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  GLASS_LIGHT: {
    id: 'glass-light',
    name: 'Glassmorphism Light',
    bgStyle: 'rgba(255, 255, 255, 0.85)',
    panelBg: 'rgba(241, 245, 249, 0.75)',
    textColor: '#0f172a',
    textMuted: '#64748b',
    accentColor: '#2563eb',
    blurPx: 16,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  MATERIAL_YOU: {
    id: 'material-you',
    name: 'Android Material Design 3',
    bgStyle: 'rgba(24, 28, 36, 0.92)',
    panelBg: 'rgba(33, 38, 48, 0.88)',
    textColor: '#e2e8f0',
    textMuted: '#94a3b8',
    accentColor: '#d0bcff',
    blurPx: 12,
    fontFamily: 'Roboto, system-ui, sans-serif'
  },
  IOS_HIG: {
    id: 'ios-hig',
    name: 'iOS Native HIG Ambient',
    bgStyle: 'rgba(0, 0, 0, 0.78)',
    panelBg: 'rgba(28, 28, 30, 0.80)',
    textColor: '#ffffff',
    textMuted: '#8e8e93',
    accentColor: '#0a84ff',
    blurPx: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
  }
};

const DEFAULT_CONFIG = {
  themeId: 'glass-dark',
  opacity: 0.85,
  blurPx: 16,
  fontSize: 18,
  fontFamily: 'sans-serif',
  lineHeight: 1.8,
  letterSpacing: 'normal'
};

export function loadOverlayConfig() {
  try {
    const raw = localStorage.getItem(OVERLAY_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load overlay config:', err);
    return DEFAULT_CONFIG;
  }
}

export function saveOverlayConfig(config) {
  try {
    localStorage.setItem(OVERLAY_CONFIG_KEY, JSON.stringify(config));
    return config;
  } catch (err) {
    console.warn('Failed to save overlay config:', err);
    return config;
  }
}
