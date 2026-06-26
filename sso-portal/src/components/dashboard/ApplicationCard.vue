<template>
  <div class="application-card premium-card">
    <div class="accent-bar" :style="{ background: accentColor }"></div>
    <div class="card-body">
      <div class="card-info">
        <h4>{{ name }}</h4>
        <p class="text-muted">{{ description }}</p>
      </div>
      <div class="card-footer">
        <span class="app-tag-small">{{ tag }}</span>
        <div class="action-group">
          <span v-if="name === 'MTP Port Net'" class="registration-label">ลงทะเบียน</span>
          <button 
            class="btn-enter" 
            :class="{ 'is-disabled': disabled }"
            :disabled="disabled"
            @click="$emit('enter')"
          >เข้าใช้งาน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  description: String,
  tag: String,
  accentColor: {
    type: String,
    default: '#4f46e5'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['enter'])
</script>

<style scoped>
.application-card { display: flex; overflow: hidden; height: 180px; }
.accent-bar { width: 8px; }
.card-body { flex: 1; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
.card-info h4 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.card-info p { font-size: 14px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.action-group { display: flex; align-items: center; gap: 12px; }
.registration-label { color: var(--text-muted); font-size: 14px; font-weight: 600; }
.app-tag-small { background: #f1f5f9; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; color: var(--text-muted); }
.btn-enter { background: #312e81; color: white; padding: 8px 24px; border-radius: var(--radius-full); font-weight: 600; font-size: 14px; transition: all 0.2s; }
.btn-enter:hover { opacity: 0.9; }
.btn-enter.is-disabled { background: #94a3b8; cursor: not-allowed; opacity: 0.8; }
</style>
