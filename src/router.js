import { createRouter, createWebHistory } from 'vue-router'
import WallpaperPreviewer from './tools/WallpaperPreviewer.vue'
import RegexTester from './tools/RegexTester.vue'

const routes = [
  { path: '/', name: 'home' },
  { path: '/tool/wallpaper-previewer', name: 'wallpaper-previewer', component: WallpaperPreviewer },
  { path: '/tool/regex-tester', name: 'regex-tester', component: RegexTester }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes
})

export default router


