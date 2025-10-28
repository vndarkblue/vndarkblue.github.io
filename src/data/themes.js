export const DEFAULT_MODE = 'dark'

export const MODE_TOKENS = {
  dark: {
    styles: {
      'color-scheme': 'dark'
    },
    cssVars: {
      '--surface': '#0f1115',
      '--surface-raised': '#171b24',
      '--surface-muted': '#0b0d11',
      '--text-primary': '#f4f6fb',
      '--text-secondary': '#9299ab',
      '--border-color': '#1e2432'
    }
  },
  light: {
    styles: {
      'color-scheme': 'light'
    },
    cssVars: {
      '--surface': '#f5f7fb',
      '--surface-raised': '#ffffff',
      '--surface-muted': '#eaeef5',
      '--text-primary': '#11131a',
      '--text-secondary': '#51586c',
      '--border-color': '#ced3df'
    }
  }
}

export const ACCENT_PRESETS = [
  {
    id: 'midnight',
    label: 'Midnight',
    tokens: {
      '--accent': '#5c6cff',
      '--accent-strong': '#2f3cff',
      '--accent-soft': 'rgba(92, 108, 255, 0.16)',
      '--accent-ink': '#081342'
    },
    modeTokens: {
      dark: {
        '--sidebar-surface': '#101735',
        '--sidebar-text': '#f4f7ff'
      },
      light: {
        '--sidebar-surface': '#e6e9ff',
        '--sidebar-text': '#131b3d'
      }
    }
  },
  {
    id: 'sakura',
    label: 'Sakura',
    tokens: {
      '--accent': '#f06ca2',
      '--accent-strong': '#e2397f',
      '--accent-soft': 'rgba(240, 108, 162, 0.18)',
      '--accent-ink': '#3d0a1f'
    },
    modeTokens: {
      dark: {
        '--sidebar-surface': '#26121b',
        '--sidebar-text': '#ffeef5'
      },
      light: {
        '--sidebar-surface': '#ffe6ef',
        '--sidebar-text': '#31121f'
      }
    }
  },
  {
    id: 'ocean',
    label: 'Ocean',
    tokens: {
      '--accent': '#1fb5c9',
      '--accent-strong': '#11879b',
      '--accent-soft': 'rgba(31, 181, 201, 0.18)',
      '--accent-ink': '#04262c'
    },
    modeTokens: {
      dark: {
        '--sidebar-surface': '#0a1e23',
        '--sidebar-text': '#e7fcff'
      },
      light: {
        '--sidebar-surface': '#ddf6f9',
        '--sidebar-text': '#0f2f34'
      }
    }
  }
]

export const DEFAULT_ACCENT_PRESET = ACCENT_PRESETS[0]

export const findAccentPreset = (id) => ACCENT_PRESETS.find((preset) => preset.id === id)

export const resolveModeTokens = (mode = DEFAULT_MODE) => MODE_TOKENS[mode] ?? MODE_TOKENS[DEFAULT_MODE]

export const resolveAccentTokens = (presetId, mode = DEFAULT_MODE) => {
  const preset = findAccentPreset(presetId) ?? DEFAULT_ACCENT_PRESET
  return {
    ...preset.tokens,
    ...(preset.modeTokens?.[mode] ?? {})
  }
}

export const resolveThemeTokens = (presetId, mode = DEFAULT_MODE) => {
  const { cssVars, styles } = resolveModeTokens(mode)
  return {
    cssVars: {
      ...cssVars,
      ...resolveAccentTokens(presetId, mode)
    },
    styles
  }
}

export const applyThemeTokens = ({
  element,
  presetId = DEFAULT_ACCENT_PRESET.id,
  mode = DEFAULT_MODE
} = {}) => {
  const target = element ?? (typeof document !== 'undefined' ? document.body : undefined)
  if (!target) return
  const { cssVars, styles } = resolveThemeTokens(presetId, mode)
  Object.entries({ ...cssVars, ...styles }).forEach(([name, value]) => {
    target.style.setProperty(name, value)
  })
}

