<template>
  <div class="notifications">
    <Bell :size="20" />
    <span v-if="count > 0" class="notification-badge">{{ count }}</span>
  </div>
</template>

<script setup>
import { Bell } from 'lucide-vue-next'

defineProps({
  count: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.notifications {
  position: relative;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: var(--radius-full);
  border: 2px solid white;
}
</style>
