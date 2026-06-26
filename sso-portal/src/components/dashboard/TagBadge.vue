<template>
  <span class="tag-badge" :class="variant">
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  label: String,
  variant: {
    type: String,
    default: 'default' // 'default', 'purple'
  }
})
</script>

<style scoped>
.tag-badge {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
}

.default { background: #f1f5f9; color: var(--text-muted); }
.purple { background: #f3e8ff; color: #7e22ce; }
</style>
