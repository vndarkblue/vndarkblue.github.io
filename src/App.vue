<script setup>
import { ref, computed } from 'vue'
import ProfileCard from './components/ProfileCard.vue'
import ToolsSection from './components/ToolsSection.vue'
import GithubProjects from './components/GithubProjects.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import WallpaperPreviewer from './tools/WallpaperPreviewer.vue'

const profile = {
  name: 'Tên của bạn',
  title: 'Software Engineer | Distributed Systems | Node.js & Microservices',
  avatarUrl: '/vite.svg',
  location: 'Vietnam',
  email: 'you@example.com',
  links: [
    { label: 'GitHub', text: 'vndarkblue', href: 'https://github.com/vndarkblue' },
    { label: 'X', text: '@yourhandle', href: 'https://x.com' },
    { label: 'LinkedIn', text: 'your-linkedin', href: 'https://linkedin.com' },
    { label: 'Website', text: 'your.site', href: 'https://example.com' },
  ],
  techStack: ['Vue', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker']
}

const tools = [
  { id: 'wallpaper-previewer', name: 'Wallpaper Previewer', description: 'Wallpaper Previewer with custom aspect ratio and background color', tag: 'UI' },
]

const selectedTool = ref(null)
function handleSelect(tool) {
  selectedTool.value = tool
}
function clearSelected() {
  selectedTool.value = null
}

const ActiveToolComponent = computed(() => {
  if (!selectedTool.value) return null
  switch (selectedTool.value.id) {
    case 'wallpaper-previewer':
      return WallpaperPreviewer
    default:
      return null
  }
})
</script>

<template>
  <div class="container">
    <aside class="left">
      <ThemeSwitcher />
      <ProfileCard
        :name="profile.name"
        :title="profile.title"
        :avatarUrl="profile.avatarUrl"
        :location="profile.location"
        :email="profile.email"
        :links="profile.links"
        :techStack="profile.techStack"
      />

      <section class="card filler">
        <h3>Experience</h3>
        <p class="muted">Thêm kinh nghiệm làm việc tại đây.</p>
      </section>

      <ToolsSection :tools="tools" title="Tools" @select="handleSelect" />
    </aside>

    <main class="right">
      <section v-if="ActiveToolComponent" class="right-card">
        <div class="tool-head">
          <div>
            <h3 class="tool-title">{{ selectedTool?.name }}</h3>
            <p class="muted" v-if="selectedTool?.description">{{ selectedTool.description }}</p>
          </div>
          <button class="close-btn" type="button" @click.stop.prevent="clearSelected" title="Đóng" aria-label="Đóng">×</button>
        </div>
        <component :is="ActiveToolComponent" @close="clearSelected" />
      </section>

      <GithubProjects username="vndarkblue" :limit="6" />
    </main>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  align-items: start;
}
.left { display: grid; gap: 16px; align-content: start; align-self: start; }
.right { display: grid; gap: 16px; align-content: start; align-items: start; align-self: start; }
.card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 16px; box-shadow: 0 8px 24px var(--shadow-color); }
.muted { color: var(--muted); font-size: 12px; }
.right-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; box-shadow: 0 8px 24px var(--shadow-color); }
.tool-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.tool-title { margin: 0; font-size: 16px; }
.close-btn { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-2); color: #e53935; font-weight: 700; line-height: 1; font-size: 24px;}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}
</style>
