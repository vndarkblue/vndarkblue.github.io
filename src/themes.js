// Theme definitions and helper functions

export const themes = [
  {
    id: 'procyon',
    name: 'Procyon (Light)',
    scheme: 'light',
    vars: {
      '--bg': 'linear-gradient(180deg, #ececf6 0%, #e5e6f0 100%)',
      '--surface': '#f7f7fb',
      '--surface-2': '#ffffff',
      '--text': '#1f2330',
      '--muted': '#7a7a85',
      '--muted-2': '#6b6b74',
      '--border': '#dedee8',
      '--accent': '#ff4d73',
      '--shadow-color': 'rgba(0, 0, 0, 0.10)',
    },
  },
  {
    id: 'sakura',
    name: 'Sakura (Light)',
    scheme: 'light',
    vars: {
      '--bg': 'linear-gradient(180deg, #fff1f4 0%, #ffe8ef 100%)',
      '--surface': '#ffffff',
      '--surface-2': '#fff7fa',
      '--text': '#33222a',
      '--muted': '#8b6b75',
      '--muted-2': '#7b5b65',
      '--border': '#f3d6de',
      '--accent': '#ff6b8a',
      '--shadow-color': 'rgba(0, 0, 0, 0.12)',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald (Light)',
    scheme: 'light',
    vars: {
      '--bg': 'linear-gradient(180deg, #e9f7ef 0%, #def4e8 100%)',
      '--surface': '#ffffff',
      '--surface-2': '#f6fffa',
      '--text': '#14322a',
      '--muted': '#5a726b',
      '--muted-2': '#4a625b',
      '--border': '#cde9dc',
      '--accent': '#06b67a',
      '--shadow-color': 'rgba(0, 0, 0, 0.10)',
    },
  }, 
  {
    id: 'midnight',
    name: 'Midnight (Dark)',
    scheme: 'dark',
    vars: {
      '--bg': 'radial-gradient(1200px 800px at 10% -10%, #1b1d2d 0%, #0d0f1a 60%, #0a0b14 100%)',
      '--surface': '#171824',
      '--surface-2': '#1d1f2c',
      '--text': '#f0f3ff',
      '--muted': '#a0a3b5',
      '--muted-2': '#9093a5',
      '--border': '#2a2d40',
      '--accent': '#6b8bff',
      '--shadow-color': 'rgba(65, 65, 65, 0.2)',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora (Dark)',
    scheme: 'dark',
    vars: {
      '--bg': 'linear-gradient(180deg, #1a1730 0%, #121326 38%, #0d0f24 100%)',
      '--surface': '#15162a',
      '--surface-2': '#1b1d34',
      '--text': '#eef0ff',
      '--muted': '#a2a5c4',
      '--muted-2': '#9497b6',
      '--border': '#2a2d4a',
      '--accent': '#b16bff',
      '--shadow-color': 'rgba(80, 80, 80, 0.2)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean (Dark)',
    scheme: 'dark',
    vars: {
      '--bg': 'linear-gradient(180deg, #0a1a26 0%, #0a1620 60%, #081018 100%)',
      '--surface': '#0f1d28',
      '--surface-2': '#122433',
      '--text': '#e9f5ff',
      '--muted': '#99b1c0',
      '--muted-2': '#8aa2b1',
      '--border': '#1e3543',
      '--accent': '#2ec5ff',
      '--shadow-color': 'rgba(39, 39, 39, 0.5)',
    },
  },
]

const STORAGE_KEY = 'themeId'

export function getSavedThemeId() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveThemeId(id) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
}

export function applyThemeById(id) {
  const theme = themes.find(t => t.id === id) || themes[0]
  applyTheme(theme)
  return theme
}

export function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  // Also set color-scheme for native UI controls
  try { root.style.colorScheme = theme.scheme } catch {}
  root.setAttribute('data-theme', theme.id)
}


