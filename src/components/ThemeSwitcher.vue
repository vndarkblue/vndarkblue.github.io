<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { themes, applyThemeById, getSavedThemeId, saveThemeId } from '../themes'

const open = ref(false)
const currentId = ref(themes[0].id)
const currentName = computed(() => (themes.find(t => t.id === currentId.value)?.name) || '')
const rootEl = ref(null)

onMounted(() => {
  const saved = getSavedThemeId()
  const applied = applyThemeById(saved || currentId.value)
  currentId.value = applied.id
  window.addEventListener('click', handleOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleOutside)
})

function handleOutside(e) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(e.target)) open.value = false
}

watch(currentId, (id) => {
  const applied = applyThemeById(id)
  saveThemeId(applied.id)
})
</script>

<template>
  <div class="theme-switcher" ref="rootEl">
    <button class="trigger" @click="open = !open" aria-label="Theme switcher">
      <span class="dot" />
      <span class="label-col">
        <span class="label">Theme</span>
        <span class="sub">{{ currentName }}</span>
      </span>
    </button>
    <Transition name="slide-down">
      <div v-if="open" class="popover">
        <div class="list">
          <button
            v-for="t in themes"
            :key="t.id"
            class="item"
            :class="{ active: currentId === t.id }"
            @click="currentId = t.id; open=false"
          >
            <span class="preview" :style="{ background: t.vars['--bg'] }"></span>
            <span class="name">{{ t.name }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
  
</template>

<style scoped>
.theme-switcher { position: relative; }
.trigger {
  display: inline-flex; gap: 10px; align-items: center;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 10px 12px; border-radius: 12px; cursor: pointer; color: var(--text);
}
.dot { width: 14px; height: 14px; background: var(--accent); border-radius: 50%; display: inline-block; box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent), transparent 75%); }
.label-col { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1; }
.label { font-weight: 600; }
.sub { color: var(--muted); font-size: 12px; }
.popover { position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 20; }
.list { display: grid; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 8px; }
.item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 10px; padding: 8px; cursor: pointer; color: var(--text);
}
.item.active { outline: 2px solid var(--accent); }
.preview { width: 28px; height: 18px; border-radius: 6px; border: 1px solid var(--border); }
.name { font-size: 13px; }
/* slide-down transition */
.slide-down-enter-active, .slide-down-leave-active {
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
.slide-down-enter-to, .slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>

