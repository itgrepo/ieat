<template>
  <div class="app-form">
    <div class="form-group">
      <label>Application Name</label>
      <input v-model="form.name" type="text" placeholder="e.g. MTP Port Net" />
    </div>
    <div class="form-group">
      <label>Category</label>
      <select v-model="form.category">
        <option>Operations</option>
        <option>Finance</option>
        <option>Security</option>
        <option>Human Resources</option>
      </select>
    </div>
    <div class="form-group">
      <label>Access URL</label>
      <input v-model="form.url" type="text" placeholder="https://..." />
    </div>
    <div class="form-actions">
      <button class="btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button class="btn-primary" @click="$emit('save', form)">Save Application</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({ name: '', category: 'Operations', url: '' }) }
})

const form = ref({ ...props.initialData })

defineEmits(['save', 'cancel'])
</script>

<style scoped>
.app-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
.form-group input, .form-group select { 
  padding: 10px 12px; 
  border: var(--border-default); 
  border-radius: var(--radius-md); 
  font-size: 14px; 
}
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
</style>
