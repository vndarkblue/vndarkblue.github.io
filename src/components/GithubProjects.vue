<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  username: { type: String, required: true },
  limit: { type: Number, default: 8 },
  title: { type: String, default: 'Github Projects' },
})

const repos = ref([])
const loading = ref(true)
const error = ref('')

async function fetchRepos() {
  try {
    loading.value = true
    error.value = ''
    const res = await fetch(`https://api.github.com/users/${props.username}/repos?per_page=100&sort=updated`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Filter out forks and pick most starred/updated
    const filtered = data.filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, props.limit)
    repos.value = filtered.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      updatedAt: r.updated_at,
    }))
  } catch (e) {
    error.value = 'Failed to load repositories.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRepos)
</script>

<template>
  <section class="right-card">
    <div class="section-head">
      <h3>{{ title }}</h3>
      <p class="muted">Showcasing {{ limit }} featured repositories</p>
    </div>

    <div class="scroll">
      <div v-if="loading" class="placeholder">Loading repositories...</div>
      <div v-else-if="error" class="placeholder">{{ error }}</div>
      <div v-else class="grid">
        <a v-for="repo in repos" :key="repo.id" :href="repo.url" class="repo" target="_blank" rel="noreferrer">
          <div class="row">
            <div class="name">{{ repo.name }}</div>
            <div class="lang" v-if="repo.language">{{ repo.language }}</div>
          </div>
          <p class="desc">{{ repo.description }}</p>
          <div class="meta">
            <span>★ {{ repo.stars }}</span>
            <span class="dot"></span>
            <span>Updated {{ new Date(repo.updatedAt).toLocaleDateString() }}</span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.right-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; box-shadow: 0 8px 24px var(--shadow-color); }
.section-head { margin-bottom: 12px; }
.section-head h3 { margin: 0; font-size: 16px; }
.muted { color: var(--muted); font-size: 12px; margin: 4px 0 0 0; }
.scroll { height: 350px; overflow: auto; padding-right: 4px; flex: 0 0 auto; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.repo { display: block; padding: 12px; border: 1px solid var(--border); background: var(--surface-2); border-radius: 12px; text-decoration: none; color: inherit; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.name { font-weight: 600; }
.lang { font-size: 11px; color: var(--muted); }
.desc { margin: 8px 0; font-size: 12px; color: var(--muted-2); }
.meta { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); display: inline-block; }
.placeholder { color: var(--muted); font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>

