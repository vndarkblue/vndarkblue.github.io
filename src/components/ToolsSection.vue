<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  tools: {
    type: Array,
    required: true,
    // [{ name, description, stars, url, tag }]
  },
  title: { type: String, default: 'Tools' },
  subtitle: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const open = ref(false)
const contentRef = ref(null)
const contentHeight = ref(0)

function measure() {
  // +2 to account for inner border not included in scrollHeight
  contentHeight.value = contentRef.value ? contentRef.value.scrollHeight + 2 : 0
}

onMounted(() => {
  nextTick(measure)
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
})

watch(() => props.tools, () => nextTick(measure), { deep: true })
watch(open, (val) => { if (val) nextTick(measure) })
</script>

<template>
  <section class="card">
    <button class="dropdown-trigger" @click="open = !open" :aria-expanded="open">
      <div class="left-side">
        <h3>{{ title }}</h3>
        <p class="muted">{{ subtitle }}</p>
      </div>
      <svg class="chev" viewBox="0 0 24 24" width="20" height="20" :style="{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
    </button>

    <div class="dropdown-anim" :style="{ maxHeight: open ? contentHeight + 'px' : '0px' }">
      <div ref="contentRef" class="dropdown-list">
        <button
          v-for="tool in tools"
          :key="tool.name"
          type="button"
          class="row"
          @click="emit('select', tool)"
        >
          <span class="name">{{ tool.name }}</span>
        </button>
      </div>
    </div>
  </section>
  
</template>

<style scoped>
.card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 8px; box-shadow: 0 8px 24px var(--shadow-color); }
.dropdown-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); cursor: pointer; }
.left-side h3 { margin: 0; font-size: 15px; }
.left-side .muted { margin: 2px 0 0 0; }
.chev { color: var(--muted); transition: transform 200ms ease; }
.dropdown-anim { margin-top: 10px; overflow: hidden; transition: max-height 250ms ease; border-radius: 12px; }
.dropdown-list { border: 1px solid var(--border); border-radius: 12px; overflow: clip; background: var(--surface-2); }
.row { display: flex; align-items: center; padding: 12px 12px; text-decoration: none; color: inherit; width: 100%; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--border); cursor: pointer; }
.row:last-child { border-bottom: none; }
.name { font-weight: 600; font-size: 13px; }
</style>

