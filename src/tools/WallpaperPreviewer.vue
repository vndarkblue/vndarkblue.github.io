<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { VMenu, VColorPicker } from 'vuetify/components'

const imageUrlInput = ref('')
const objectUrl = ref('')
const backgroundColor = ref('#101015')

// Aspect ratio selection
const aspectOptions = [
  '16:9','9:16','21:9','19:6','6:19','20:9','9:20','4:3','3:2','1:1','32:9','4:5'
]
const selectedAspect = ref('16:9')
const customW = ref(16)
const customH = ref(9)
const LS_KEYS = {
  selectedAspect: 'wp.selectedAspect',
  customW: 'wp.customW',
  customH: 'wp.customH'
}
const usingCustom = computed(() => selectedAspect.value === 'custom')
const aspectWH = computed(() => {
  if (usingCustom.value) {
    const w = Number.isFinite(customW.value) && customW.value > 0 ? customW.value : 1
    const h = Number.isFinite(customH.value) && customH.value > 0 ? customH.value : 1
    return { w, h }
  }
  const parts = selectedAspect.value.split(':').map(Number)
  const w = Math.max(1, parts[0] || 16)
  const h = Math.max(1, parts[1] || 9)
  return { w, h }
})

watch(customW, (val) => {
  if (!Number.isFinite(val) || val <= 0) customW.value = 1
})
watch(customH, (val) => {
  if (!Number.isFinite(val) || val <= 0) customH.value = 1
})

// Persist aspect choice + custom dimensions
watch(selectedAspect, (val) => {
  try { localStorage.setItem(LS_KEYS.selectedAspect, val) } catch (_) { /* noop */ }
})
watch(customW, (val) => {
  try { localStorage.setItem(LS_KEYS.customW, String(val)) } catch (_) { /* noop */ }
})
watch(customH, (val) => {
  try { localStorage.setItem(LS_KEYS.customH, String(val)) } catch (_) { /* noop */ }
})

onMounted(() => {
  try {
    const savedAspect = localStorage.getItem(LS_KEYS.selectedAspect)
    if (savedAspect && (savedAspect === 'custom' || aspectOptions.includes(savedAspect))) {
      selectedAspect.value = savedAspect
    }
    const savedW = localStorage.getItem(LS_KEYS.customW)
    if (savedW != null) {
      const n = parseInt(savedW, 10)
      if (Number.isFinite(n) && n > 0) customW.value = n
    }
    const savedH = localStorage.getItem(LS_KEYS.customH)
    if (savedH != null) {
      const n = parseInt(savedH, 10)
      if (Number.isFinite(n) && n > 0) customH.value = n
    }
  } catch (_) { /* noop */ }
})

// Fill/Fit toggle
const mode = ref('fill') // 'fill' | 'fit'
const backgroundSize = computed(() => (mode.value === 'fill' ? 'cover' : 'contain'))

const displayUrl = computed(() => objectUrl.value || imageUrlInput.value)

// Drag-to-pan (Fill mode)
const posX = ref(50) // percent
const posY = ref(50) // percent
const isDragging = ref(false)
const activePointerId = ref(null)
const startX = ref(0)
const startY = ref(0)
const startPosX = ref(50)
const startPosY = ref(50)
const startRectW = ref(1)
const startRectH = ref(1)
const bgPosition = computed(() => (mode.value === 'fill' ? `${posX.value}% ${posY.value}%` : 'center'))

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)) }

function onPointerDown(e) {
  if (mode.value !== 'fill' || !displayUrl.value) return
  const rect = e.currentTarget?.getBoundingClientRect?.()
  if (!rect) return
  isDragging.value = true
  activePointerId.value = e.pointerId
  startX.value = e.clientX
  startY.value = e.clientY
  startPosX.value = posX.value
  startPosY.value = posY.value
  startRectW.value = Math.max(1, rect.width)
  startRectH.value = Math.max(1, rect.height)
  try { e.currentTarget?.setPointerCapture?.(e.pointerId) } catch (_) { /* noop */ }
}

function onPointerMove(e) {
  if (!isDragging.value || e.pointerId !== activePointerId.value) return
  const dx = e.clientX - startX.value
  const dy = e.clientY - startY.value
  const nextX = startPosX.value - (dx / startRectW.value) * 100
  const nextY = startPosY.value - (dy / startRectH.value) * 100
  posX.value = clamp(nextX, 0, 100)
  posY.value = clamp(nextY, 0, 100)
}

function onPointerUp(e) {
  if (!isDragging.value || (activePointerId.value != null && e.pointerId !== activePointerId.value)) return
  isDragging.value = false
  try { e.currentTarget?.releasePointerCapture?.(activePointerId.value) } catch (_) { /* noop */ }
  activePointerId.value = null
}

function resetPan() {
  posX.value = 50
  posY.value = 50
}

watch([displayUrl, mode], () => {
  resetPan()
})

function setFile(file) {
  if (!file) return
  if (!file.type?.startsWith('image/')) return
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = URL.createObjectURL(file)
}

function onFileChange(event) {
  const file = event.target?.files?.[0]
  setFile(file)
}

function onDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  setFile(file)
}

function isLikelyImageUrl(text) {
  if (!text) return false
  const s = text.trim()
  if (/^data:image\//i.test(s)) return true
  if (/^https?:\/\//i.test(s)) return true
  return /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(s)
}

function onPaste(e) {
  const items = e.clipboardData?.items || []
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) { setFile(file); return }
    }
  }
  const text = e.clipboardData?.getData('text')
  if (isLikelyImageUrl(text)) {
    imageUrlInput.value = text.trim()
  }
}

function clearImage() {
  imageUrlInput.value = ''
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

watch(imageUrlInput, () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
})
</script>

<template>
  <div class="wp">
    <div class="controls">
      <select class="select" v-model="selectedAspect" aria-label="Aspect ratio">
        <option v-for="opt in aspectOptions" :key="opt" :value="opt">{{ opt }}</option>
        <option value="custom">Custom</option>
      </select>

      <div v-if="usingCustom" class="ratio-inputs" aria-label="Custom aspect ratio inputs">
        <input
          class="ratio-input"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          v-model.number="customW"
          aria-label="Chiều rộng"
          placeholder="W"
        />
        <span class="ratio-sep">:</span>
        <input
          class="ratio-input"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          v-model.number="customH"
          aria-label="Chiều cao"
          placeholder="H"
        />
      </div>

      <input
        class="input"
        type="url"
        v-model.trim="imageUrlInput"
        placeholder="Paste image URL (jpg/png/webp)"
        spellcheck="false"
      />

      <label class="file-btn">
        <input type="file" accept="image/*" @change="onFileChange" />
        Select image
      </label>

      <button class="ghost" @click="clearImage" :disabled="!displayUrl">Delete</button>

      <div class="spacer"></div>

      <div class="segmented" role="group" aria-label="Fill or Fit">
        <button type="button" :class="{ active: mode==='fill' }" @click="mode='fill'">Fill</button>
        <button type="button" :class="{ active: mode==='fit' }" @click="mode='fit'">Fit</button>
      </div>

      <VMenu location="bottom" transition="fade-transition">
        <template #activator="{ props }">
          <button class="color-btn" type="button" v-bind="props">
            <span class="swatch" :style="{ background: backgroundColor }"></span>
            <span>Background color</span>
          </button>
        </template>
        <div class="picker-wrap">
          <VColorPicker v-model="backgroundColor" mode="hexa" hide-inputs hide-eye-dropper/>
        </div>
      </VMenu>
    </div>

    <div
      v-if="displayUrl"
      class="preview"
      :class="{ dragging: isDragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
      :style="{
        backgroundImage: `url(${displayUrl})`,
        backgroundSize,
        backgroundPosition: bgPosition,
        backgroundColor,
        aspectRatio: `${aspectWH.w} / ${aspectWH.h}`,
        maxHeight: '70vh',
        maxWidth: `calc(70vh * ${aspectWH.w / aspectWH.h})`
      }"
    ></div>
    <div v-else class="wallpaper-placeholder" @paste="onPaste" @dragover.prevent @drop.prevent="onDrop" tabindex="0">Click here and Ctrl+V to paste image/URL, or drag and drop image into here.</div>
  </div>
  
</template>

<style scoped>
.wp { display: grid; gap: 12px; }
.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.input {
  flex: 1 1 280px;
  min-width: 220px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-2);
  color: var(--text);
}
.file-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-raised);
  color: var(--text);
  cursor: pointer;
}
.file-btn input[type="file"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.ghost {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--muted);
  transition: all 0.2s ease;
}
.ghost:not(:disabled) {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  font-weight: 600;
}
.ghost:not(:disabled):hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #dc2626;
}
.ghost:disabled { 
  opacity: 0.3; 
  cursor: not-allowed; 
}
.select { padding: 10px 12px; border: 1px solid var(--border-color); background: var(--surface-raised); color: var(--text); }
.ratio-inputs { display: inline-flex; align-items: center; gap: 6px; }
.ratio-input { width: 72px; padding: 10px 12px; border: 1px solid var(--border-color); background: var(--surface-raised); color: var(--text); }
.ratio-sep { color: var(--muted); font-weight: 600; }
.color-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border-color); background: var(--surface-raised); color: var(--text); }
.v-color-picker__controls, .v-picker__body {background-color: var(--surface-raised) !important;}

.swatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--border-color); display: inline-block; }
.picker-wrap { padding: 8px; background: var(--surface-raised); border: 1px solid var(--border-color); border-radius: 12px; }
.segmented { display: inline-flex; border: 1px solid var(--border-color); overflow: hidden; }
.segmented button { padding: 10px 12px; background: var(--surface-raised); border: none; color: var(--text); cursor: pointer; }
.segmented button.active { background: var(--surface); font-weight: 600; }
.spacer { flex: 1 1 auto; }
.preview {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-repeat: no-repeat;
  background-clip: border-box;
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.preview.dragging { cursor: grabbing; }
.wallpaper-placeholder { color: var(--text-secondary); font-size: 13px; padding: 24px; border: 1px dashed var(--border-color); border-radius: 12px; background: var(--surface-raised); }

.v-sheet {background-color: var(--surface-raised) !important;}
</style>

