<template>
  <div class="app-manage-card premium-card">
    <div class="app-info">
      <h4>{{ name }}</h4>
      <p class="text-muted">{{ url }}</p>
    </div>

    <div class="app-settings">
      <div class="setting-item">
        <label>Login Source</label>
        <select :value="source" @input="$emit('update:source', $event.target.value)">
          <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="setting-item">
        <label>Access Policy</label>
        <select :value="policy" @input="$emit('update:policy', $event.target.value)">
          <option v-for="p in policies" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
    </div>

    <div class="app-actions">
      <button class="btn-text" @click="$emit('stats')">View Stats</button>
      <button class="btn-primary-sm" @click="$emit('save')">Save Changes</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  url: String,
  source: String,
  policy: String,
  sources: Array,
  policies: Array
})

defineEmits(['update:source', 'update:policy', 'stats', 'save'])
</script>

<style scoped>
.app-manage-card { padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 40px; }
.app-info { flex: 1; }
.app-info h4 { font-size: 18px; margin-bottom: 4px; }
.app-settings { display: flex; gap: 24px; flex: 2; }
.setting-item { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.setting-item label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.setting-item select { padding: 8px 12px; border-radius: var(--radius-sm); border: var(--border-default); font-size: 14px; }
.app-actions { display: flex; gap: 12px; align-items: center; }
.btn-primary-sm { background: var(--primary-color); color: white; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; }
.btn-text { color: var(--primary-color); font-weight: 600; font-size: 13px; }
</style>
