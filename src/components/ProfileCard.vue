<script setup>
const props = defineProps({
  name: { type: String, required: true },
  title: { type: String, required: true },
  avatarUrl: { type: String, required: false, default: '/vite.svg' },
  location: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  links: { type: Array, required: false, default: () => [] },
  techStack: { type: Array, required: false, default: () => [] },
})
</script>

<template>
  <section class="card profile-card">
    <div class="profile-header">
      <img :src="avatarUrl" alt="avatar" class="avatar" />
      <div class="profile-meta">
        <h2 class="name">{{ name }}</h2>
        <p class="subtitle">{{ title }}</p>
      </div>
    </div>

    <div class="profile-info">
      <div v-if="location" class="info-row">
        <span class="label">Based in</span>
        <span class="value">{{ location }}</span>
      </div>
      <div v-if="email" class="info-row">
        <span class="label">Email</span>
        <a class="value" :href="`mailto:${email}`">{{ email }}</a>
      </div>
      <div v-for="link in links" :key="link.label" class="info-row">
        <span class="label">{{ link.label }}</span>
        <a class="value" :href="link.href" target="_blank" rel="noreferrer">{{ link.text }}</a>
      </div>
    </div>

    <div v-if="techStack.length" class="tech-stack">
      <span v-for="tech in techStack" :key="tech" class="chip">{{ tech }}</span>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: 0 8px 24px var(--shadow-color);
}
.profile-header { display: flex; align-items: center; gap: 16px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent); object-fit: cover; }
.name { margin: 0 0 4px 0; font-size: 20px; }
.subtitle { margin: 0; color: var(--muted); font-size: 13px; }
.profile-info { margin-top: 16px; display: grid; gap: 8px; }
.info-row { display: grid; grid-template-columns: 120px 1fr; align-items: center; }
.label { color: var(--muted); font-size: 12px; }
.value { font-size: 13px; color: var(--text); }
.tech-stack { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: var(--surface-2); border: 1px solid var(--border); padding: 4px 10px; border-radius: 999px; font-size: 12px; }
</style>


