<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT_PRESET,
  DEFAULT_MODE,
  findAccentPreset,
  applyThemeTokens
} from './data/themes'
import { GITHUB_PROFILE } from './data/profile'

const profile = GITHUB_PROFILE
const avatarUrl = `https://github.com/${profile.username}.png`

const profileDisplayName = ref(profile.username)

const loadGithubProfileName = async () => {
  try {
    const response = await fetch(`https://api.github.com/users/${profile.username}`)
    if (!response?.ok) return
    const data = await response.json()
    if (data && data.name) {
      profileDisplayName.value = data.name
    }
  } catch (_) { /* noop */ }
}

const mode = ref(DEFAULT_MODE)
const theme = ref(DEFAULT_ACCENT_PRESET.id)
const view = ref('tools')
const switcherOpen = ref(false)
const accentIndicator = ref(null)
const switcherTrigger = ref(null)

const sections = [
  { id: 'tools', label: 'Tools' },
  { id: 'quick-links', label: 'Quick Links' },
  { id: 'contact', label: 'About Me' }
]

const accentOptions = ACCENT_PRESETS

const tools = [
  {
    title: 'Wallpaper Previewer',
    description: 'Wallpaper Previewer with custom aspect ratios',
    links: [
      { label: 'Open', route: { name: 'wallpaper-previewer' } }
    ]
  },
  {
    title: 'Regex Tester',
    description: 'Test and debug regular expressions with live preview',
    links: [
      { label: 'Open', route: { name: 'regex-tester' } }
    ]
  },
  {
    title: 'Palette Switchboard',
    description: 'Preview token-driven color palettes across light and dark systems.',
    links: [
      { label: 'Live Demo', href: 'https://vndarkblue.github.io/palette-switchboard' },
      { label: 'Source Code', href: 'https://github.com/vndarkblue/palette-switchboard' }
    ]
  },
  {
    title: 'Prompt Ledger',
    description: 'Organise reusable AI prompts with tagging, filters, and exports.',
    links: [
      { label: 'Live Demo', href: 'https://vndarkblue.github.io/prompt-ledger' },
      { label: 'Source Code', href: 'https://github.com/vndarkblue/prompt-ledger' }
    ]
  }
]

const quickLinks = [
  { 
    label: 'MDN Web Docs', 
    href: 'https://developer.mozilla.org/',
    icon: 'https://cdn.simpleicons.org/mdnwebdocs/000000',
    description: 'Comprehensive web development documentation and guides'
  },
  {
    label: 'W3Schools',
    href: 'https://www.w3schools.com/',
    icon: 'https://cdn.simpleicons.org/w3schools/04AA6D',
    description: 'Free web development tutorials'
  },
  { 
    label: 'React Docs', 
    href: 'https://beta.reactjs.org/',
    icon: 'https://cdn.simpleicons.org/react/61DAFB',
    description: 'Official React documentation and learning resources'
  },
  { 
    label: 'Design Systems Repo', 
    href: 'https://designsystemsrepo.com/',
    icon: 'https://designsystemsrepo.com/assets/static/dsr-logo.1915896.962d50778e6632ee7f7ac8faedd152db.svg',
    description: 'Curated collection of design systems and pattern libraries'
  },
  { 
    label: 'Figma Community', 
    href: 'https://figma.com/community',
    icon: 'https://cdn.simpleicons.org/figma/F24E1E',
    description: 'Design resources, templates, and community creations'
  }
]

const contactLinks = computed(() => {
  const links = profile.socialLinks || []
  return links.filter(link => link.id === 'discord' || !!link.href)
})

const discordCopied = ref(false)
let discordTooltipTimeout = 0

const copyDiscord = async () => {
  const username = profile.discordUsername
  if (!username) return
  try {
    await navigator.clipboard.writeText(username)
  } catch (_) {
    try {
      const el = document.createElement('textarea')
      el.value = username
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    } catch (_) { /* noop */ }
  }
  discordCopied.value = true
  if (discordTooltipTimeout) window.clearTimeout(discordTooltipTimeout)
  discordTooltipTimeout = window.setTimeout(() => { discordCopied.value = false }, 1500)
}

const capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const iconUrl = (contact) => {
  if (contact && contact.icon) return contact.icon
  if (contact && contact.id === 'linkedin') {
    return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg'
  }
  const id = contact?.id || 'link'
  return `https://cdn.simpleicons.org/${id}/ffffff`
}

const modeLabel = computed(() => capitalise(mode.value))
const modeTitle = computed(() => (mode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'))
const modeIcon = computed(() => (mode.value === 'dark' ? '☾' : '☀'))
const modePressed = computed(() => (mode.value === 'dark' ? 'true' : 'false'))
const switcherExpanded = computed(() => (switcherOpen.value ? 'true' : 'false'))
const switcherHidden = computed(() => (switcherOpen.value ? 'false' : 'true'))

const updateBodyAttributes = () => {
  document.body.setAttribute('data-mode', mode.value)
  document.body.setAttribute('data-theme', theme.value)
  applyThemeTokens({ presetId: theme.value, mode: mode.value })
}

const updateAccentIndicator = () => {
  if (!accentIndicator.value) return
  const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-strong')
  accentIndicator.value.style.backgroundColor = accentColor.trim()
}

const refreshAccentIndicator = () => {
  requestAnimationFrame(updateAccentIndicator)
}

watch([mode, theme], () => {
  updateBodyAttributes()
  refreshAccentIndicator()
}, { immediate: true })

const toggleMode = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
}

const setTheme = (themeId) => {
  if (!findAccentPreset(themeId)) return
  theme.value = themeId
}

const route = useRoute()
const router = useRouter()

const isToolRoute = computed(() => !!(route.path && route.path.startsWith('/tool/')))

const currentTool = computed(() => {
  if (!isToolRoute.value) return null
  const toolName = route.name
  return tools.find(tool => {
    if (tool.links && tool.links.length > 0) {
      return tool.links.some(link => link.route && link.route.name === toolName)
    }
    return false
  })
})

const toolHeader = computed(() => {
  if (currentTool.value) {
    return {
      title: currentTool.value.title,
      description: currentTool.value.description
    }
  }
  return {
    title: 'Tools',
    description: 'Selected tools built for everyday problem solving.'
  }
})

const setView = (viewId) => {
  view.value = viewId
  if (isToolRoute.value) {
    router.replace({ path: '/' })
  }
}

const toggleSwitcher = () => {
  switcherOpen.value = !switcherOpen.value
}

const closeSwitcher = () => {
  switcherOpen.value = false
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeSwitcher()
  }
}

const handleClickOutside = (event) => {
  if (!switcherOpen.value) return
  const trigger = switcherTrigger.value
  const panel = trigger?.nextElementSibling
  if (!trigger || !panel) return
  if (trigger.contains(event.target) || panel.contains(event.target)) return
  closeSwitcher()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  refreshAccentIndicator()
  loadGithubProfileName()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})

watch(() => route.path, (path) => {
  if (path && path.startsWith('/tool/')) {
    view.value = 'tools'
  }
}, { immediate: true })

watch(() => currentTool.value, (tool) => {
  if (tool) {
    document.title = `${tool.title} - DarkBlue's Toolbox`
  } else {
    document.title = "DarkBlue's Toolbox"
  }
}, { immediate: true })
</script>

<template>
  <div class="page">
    <aside class="sidebar">
      <div class="sidebar__top">
        <div class="brand">
          <h1>DarkBlue Toolbox</h1>
          <p>Focused tools and prototypes for efficient workflows.</p>
        </div>
        <div class="sidebar__controls">
          <div class="display-switcher" :class="{ 'is-open': switcherOpen }">
            <button
              class="display-switcher__trigger"
              type="button"
              @click="toggleSwitcher"
              aria-controls="display-panel"
              ref="switcherTrigger"
              :aria-expanded="switcherExpanded"
            >
              <span class="display-switcher__icon" aria-hidden="true">{{ modeIcon }}</span>
              <span class="display-switcher__accent" aria-hidden="true" ref="accentIndicator"></span>
            </button>
            <div
              class="display-switcher__panel"
              id="display-panel"
              :aria-hidden="switcherHidden"
              :hidden="!switcherOpen"
            >
              <button
                class="mode-toggle"
                type="button"
                aria-live="polite"
                :aria-pressed="modePressed"
                :title="modeTitle"
                @click="toggleMode"
              >
                <span class="mode-toggle__title">Theme mode</span>
                <span class="mode-toggle__state">{{ modeLabel }}</span>
              </button>
              <div class="accent-picker">
                <span class="accent-picker__label" id="accent-label">Accent presets</span>
                <div class="accent-options" role="group" aria-labelledby="accent-label">
                  <button
                    v-for="option in accentOptions"
                    :key="option.id"
                    class="accent-option"
                    type="button"
                    :class="{ 'is-active': theme === option.id }"
                    @click="setTheme(option.id)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <nav class="sidebar__navigation" aria-label="Sections">
            <button
              v-for="section in sections"
              :key="section.id"
              class="nav-item"
              type="button"
              :class="{ 'is-active': view === section.id && !(section.id === 'tools' && isToolRoute) }"
              @click="setView(section.id)"
            >
              {{ section.label }}
            </button>
          </nav>
        </div>
      </div>
    </aside>
    <main class="content">
      <section class="section" :class="{ 'is-active': view === 'tools' }" data-view-panel="tools">
        <header class="section__head">
          <h2>{{ toolHeader.title }}</h2>
          <p>{{ toolHeader.description }}</p>
        </header>
        <router-view v-slot="{ Component }">
          <div v-if="Component" class="card">
            <component :is="Component" />
          </div>
          <div v-else class="tool-grid">
            <article v-for="tool in tools" :key="tool.title" class="card tool-card">
              <h3>{{ tool.title }}</h3>
              <p>{{ tool.description }}</p>
              <div class="link-group">
                <template v-for="link in tool.links" :key="link.label + (link.route || link.href)">
                  <router-link v-if="link.route" :to="link.route" @click="setView('tools')">
                    {{ link.label }}
                  </router-link>
                  <a v-else :href="link.href" target="_blank" rel="noopener">{{ link.label }}</a>
                </template>
              </div>
            </article>
          </div>
        </router-view>
      </section>
      <section class="section" :class="{ 'is-active': view === 'quick-links' }" data-view-panel="quick-links">
        <header class="section__head">
          <h2>Quick Links</h2>
          <p>Reference sites that keep the workflow precise.</p>
        </header>
        <div class="quick-links">
          <article v-for="resource in quickLinks" :key="resource.href" class="quick-link-card">
            <div class="quick-link-card__icon">
              <img :src="resource.icon" :alt="resource.label + ' icon'" loading="lazy" />
            </div>
            <div class="quick-link-card__content">
              <h3 class="quick-link-card__title">
                <a :href="resource.href" target="_blank" rel="noopener">{{ resource.label }}</a>
              </h3>
              <p class="quick-link-card__description">{{ resource.description }}</p>
            </div>
          </article>
        </div>
      </section>
      <section class="section" :class="{ 'is-active': view === 'contact' }" data-view-panel="contact">
        <header class="section__head">
          <h2>About Me</h2>
          <p>Connect through the channels that stay active.</p>
        </header>
        <div class="about-me">
          <div class="about-me__avatar">
            <!-- clicking the avatar should open the profile page -->
            <a :href="`https://github.com/${profile.username}`" target="_blank" rel="noopener">
              <img :src="avatarUrl" :alt="`GitHub avatar of ${profile.username}`" loading="lazy" />
            </a>
          </div>
          <h3 class="about-me__name">{{ profileDisplayName }}</h3>
          <p class="about-me__bio">I'm lazy, so I'm making tools to help me do things faster.</p>
        </div>
        <div class="contact-grid">
          <template v-for="contact in contactLinks" :key="contact.id + (contact.href || '')">
            <button
              v-if="contact.id === 'discord'"
              type="button"
              class="contact-button is-discord has-tooltip"
              @click="copyDiscord"
            >
              <img class="contact-button__icon" :src="iconUrl(contact)" :alt="contact.label + ' logo'" loading="lazy" />
              <span class="contact-button__label">{{ contact.label }}</span>
              <span class="tooltip" role="status" aria-live="polite" v-show="discordCopied">Username copied</span>
            </button>
            <a
              v-else
              class="contact-button"
              :class="'is-' + contact.id"
              :href="contact.href"
              target="_blank"
              rel="noopener"
            >
              <img class="contact-button__icon" :src="iconUrl(contact)" :alt="contact.label + ' logo'" loading="lazy" />
              <span class="contact-button__label">{{ contact.label }}</span>
            </a>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>
