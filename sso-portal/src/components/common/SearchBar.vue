<template>
  <div class="search-bar">
    <Search :size="18" class="search-icon" />
    <input type="text" :placeholder="placeholder" @input="$emit('search', $event.target.value)" />
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next'

defineProps({
  placeholder: {
    type: String,
    default: 'Search here...'
  }
})

defineEmits(['search'])
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-bar input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border-radius: var(--radius-full);
  border: var(--border-default);
  background: var(--bg-main);
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: var(--primary-color);
  outline: none;
}
</style>
