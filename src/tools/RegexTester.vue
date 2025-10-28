<script setup>
import { ref, computed, watch } from 'vue'

const regexPattern = ref('')
const testString = ref('')
const flags = ref({
  global: false,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false
})

const regexError = ref('')
const matches = ref([])
const isValidRegex = ref(true)

const flagsString = computed(() => {
  const activeFlags = []
  if (flags.value.global) activeFlags.push('g')
  if (flags.value.ignoreCase) activeFlags.push('i')
  if (flags.value.multiline) activeFlags.push('m')
  if (flags.value.dotAll) activeFlags.push('s')
  if (flags.value.unicode) activeFlags.push('u')
  if (flags.value.sticky) activeFlags.push('y')
  return activeFlags.join('')
})

const compiledRegex = computed(() => {
  if (!regexPattern.value) return null
  
  try {
    const regex = new RegExp(regexPattern.value, flagsString.value)
    regexError.value = ''
    isValidRegex.value = true
    return regex
  } catch (error) {
    regexError.value = error.message
    isValidRegex.value = false
    return null
  }
})

const testResults = computed(() => {
  if (!compiledRegex.value || !testString.value) {
    matches.value = []
    return []
  }

  const results = []
  const regex = compiledRegex.value
  
  if (flags.value.global) {
    let match
    while ((match = regex.exec(testString.value)) !== null) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        fullMatch: match
      })
      
      // Prevent infinite loop on zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }
  } else {
    const match = regex.exec(testString.value)
    if (match) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        fullMatch: match
      })
    }
  }
  
  matches.value = results
  return results
})

const highlightedText = computed(() => {
  if (!testString.value || !compiledRegex.value || testResults.value.length === 0) {
    return testString.value
  }

  let result = testString.value
  let offset = 0
  
  // Sort matches by index in reverse order to avoid index shifting issues
  const sortedMatches = [...testResults.value].sort((a, b) => b.index - a.index)
  
  sortedMatches.forEach(match => {
    const start = match.index + offset
    const end = start + match.match.length
    const before = result.substring(0, start)
    const matched = result.substring(start, end)
    const after = result.substring(end)
    
    result = before + `<mark class="regex-match">${matched}</mark>` + after
    offset += 25 // Length of <mark class="regex-match"></mark>
  })
  
  return result
})

function clearAll() {
  regexPattern.value = ''
  testString.value = ''
  Object.keys(flags.value).forEach(key => {
    flags.value[key] = false
  })
}

function loadExample(example) {
  switch (example) {
    case 'email':
      regexPattern.value = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      testString.value = 'Contact us at support@example.com or admin@test.org for help.'
      flags.value.multiline = true
      break
    case 'phone':
      regexPattern.value = '\\+?[1-9]\\d{1,14}'
      testString.value = 'Call us at +1234567890 or 9876543210'
      break
    case 'url':
      regexPattern.value = 'https?://[^\\s]+'
      testString.value = 'Visit https://example.com or http://test.org for more info.'
      break
    case 'date':
      regexPattern.value = '\\d{4}-\\d{2}-\\d{2}'
      testString.value = 'Today is 2024-01-15 and tomorrow is 2024-01-16'
      break
    case 'ipv4':
      regexPattern.value = '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b'
      testString.value = 'Server IPs: 192.168.1.1, 10.0.0.1, 172.16.0.1, and 255.255.255.0'
      break
    case 'hexcolor':
      regexPattern.value = '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}'
      testString.value = 'Colors: #FF5733, #3498db, #2ecc71, #f39c12, #e74c3c, #9b59b6'
      break
    case 'uuid':
      regexPattern.value = '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b'
      testString.value = 'UUIDs: 550e8400-e29b-41d4-a716-446655440000, 6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      break
    case 'datetime':
      regexPattern.value = '\\d{4}-\\d{2}-\\d{2}'
      testString.value = 'Dates: 2024-01-15, 2023-12-25, 2024-02-29'
      break
    case 'time':
      regexPattern.value = '\\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\\b'
      testString.value = 'Times: 09:30, 14:45, 23:59, 00:00, 12:15'
      break
  }
}

// Auto-test when pattern or string changes
watch([regexPattern, testString, flags], () => {
  testResults.value
}, { deep: true })
</script>

<template>
  <div class="regex-tester">
    <div class="controls">
      <div class="input-group">
        <input
          class="input"
          type="text"
          v-model="regexPattern"
          placeholder="Enter regex pattern (e.g., \\d+)"
          spellcheck="false"
        />
        <div v-if="regexError" class="error">{{ regexError }}</div>
      </div>

      <div class="flags-section">
        <div class="flags-grid">
          <label class="flag-item">
            <input type="checkbox" v-model="flags.global" />
            <span>Global (g)</span>
          </label>
          <label class="flag-item">
            <input type="checkbox" v-model="flags.ignoreCase" />
            <span>Ignore Case (i)</span>
          </label>
          <label class="flag-item">
            <input type="checkbox" v-model="flags.multiline" />
            <span>Multiline (m)</span>
          </label>
          <label class="flag-item">
            <input type="checkbox" v-model="flags.dotAll" />
            <span>Dot All (s)</span>
          </label>
          <label class="flag-item">
            <input type="checkbox" v-model="flags.unicode" />
            <span>Unicode (u)</span>
          </label>
          <label class="flag-item">
            <input type="checkbox" v-model="flags.sticky" />
            <span>Sticky (y)</span>
          </label>
        </div>
      </div>

      <textarea
        class="textarea"
        v-model="testString"
        placeholder="Enter text to test against the regex pattern"
        rows="4"
      ></textarea>

      <div class="actions">
        <div class="examples">
          <span class="label">Examples:</span>
          <button class="example-btn" @click="loadExample('email')">Email</button>
          <button class="example-btn" @click="loadExample('phone')">Phone</button>
          <button class="example-btn" @click="loadExample('url')">URL</button>
          <button class="example-btn" @click="loadExample('date')">Date</button>
          <button class="example-btn" @click="loadExample('ipv4')">IPv4</button>
          <button class="example-btn" @click="loadExample('hexcolor')">Hex Color</button>
          <button class="example-btn" @click="loadExample('uuid')">UUID</button>
          <button class="example-btn" @click="loadExample('datetime')">Date (YYYY-MM-DD)</button>
          <button class="example-btn" @click="loadExample('time')">Time (HH:MM)</button>
        </div>
        <button class="clear-btn" @click="clearAll">Clear All</button>
      </div>
    </div>

    <div v-if="regexPattern && testString" class="results">
      <div class="result-header">
        <h4>Results</h4>
        <span class="match-count">{{ testResults.length }} match{{ testResults.length !== 1 ? 'es' : '' }}</span>
      </div>

      <div v-if="testResults.length > 0" class="highlighted-text" v-html="highlightedText"></div>
      <div v-else class="no-matches">No matches found</div>

      <div v-if="testResults.length > 0" class="matches-list">
        <div v-for="(match, index) in testResults" :key="index" class="match-item">
          <div class="match-info">
            <span class="match-text">{{ match.match }}</span>
            <span class="match-index">at position {{ match.index }}</span>
          </div>
          <div v-if="match.groups.length > 0" class="groups">
            <div v-for="(group, groupIndex) in match.groups" :key="groupIndex" class="group">
              <span class="group-label">Group {{ groupIndex + 1 }}:</span>
              <span class="group-text">{{ group || '(empty)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.regex-tester {
  display: grid;
  gap: 12px;
}

.controls {
  display: grid;
  gap: 12px;
}

.input-group {
  display: grid;
  gap: 8px;
}

.label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-2);
  color: var(--text);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-2);
  color: var(--text);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

.error {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.flags-section {
  display: grid;
  gap: 8px;
}

.flags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-raised);
  cursor: pointer;
  font-size: 13px;
}

.flag-item input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.examples {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.example-btn {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-raised);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}

.example-btn:hover {
  background: var(--surface);
}

.clear-btn {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
}

.results {
  border: 1px solid var(--border-color);
  background: var(--surface-raised);
  padding: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--text);
}

.match-count {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.highlighted-text {
  background: var(--surface);
  padding: 12px;
  border: 1px solid var(--border-color);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.regex-match {
  background: #ffeb3b;
  color: #000;
  padding: 2px 4px;
  font-weight: 600;
}

.no-matches {
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
  padding: 24px;
}

.matches-list {
  display: grid;
  gap: 12px;
}

.match-item {
  border: 1px solid var(--border-color);
  background: var(--surface);
  padding: 12px;
}

.match-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.match-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: var(--surface-raised);
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  font-weight: 600;
}

.match-index {
  font-size: 12px;
  color: var(--text-secondary);
}

.groups {
  display: grid;
  gap: 4px;
}

.group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.group-label {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.group-text {
  font-family: 'Courier New', monospace;
  background: var(--surface-raised);
  padding: 2px 6px;
  border: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .flags-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .examples {
    justify-content: center;
  }
}
</style>
