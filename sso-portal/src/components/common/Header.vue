<template>
  <header class="header">
    <div class="header-left">
      <h2 class="title">{{ title }}</h2>
    </div>
    
    <div class="header-right">
    </div>
  </header>
</template>

<script setup>
const userStr = localStorage.getItem('sso_user') || localStorage.getItem('user');
const activeUser = userStr ? JSON.parse(userStr) : null;

defineProps({
  title: {
    type: String,
    default: 'Digital Smart Port'
  },
  notificationCount: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.header {
  height: var(--header-height);
  background: white;
  border-bottom: var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 90;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
