<template>
  <header class="top-header">
    <div class="page-title">
      <h2>{{ currentRouteName }}</h2>
    </div>
    
    <div class="header-actions">
      <div class="search-bar">
        <Search :size="18" class="search-icon" />
        <input type="text" placeholder="Default Search here..." />
      </div>

      <div class="notifications">
        <Bell :size="20" />
        <span class="notification-badge">3</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Bell } from 'lucide-vue-next'

const route = useRoute()
const currentRouteName = computed(() => {
  if (route.name === 'Dashboard') return 'Digital Smart Port'
  return route.name || 'Digital Smart Port'
})
</script>

<style scoped>
.top-header {
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 90;
}

.page-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e1b4b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

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
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
}

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
  border-radius: 10px;
  border: 2px solid white;
}
</style>
