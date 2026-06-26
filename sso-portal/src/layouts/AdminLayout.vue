<template>
  <div class="layout-wrapper admin-theme">
    <Sidebar />
    <div class="main-container">
      <Header :title="adminTitle" :notificationCount="5" />
      <div class="admin-content-header">
        <slot name="header-actions"></slot>
      </div>
      <main class="content">
        <slot></slot>
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/common/Sidebar.vue'
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'

defineProps({
  adminTitle: {
    type: String,
    default: 'Digital Smart Port'
  }
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.main-container {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 30px;
  background: var(--bg-main);
}

.admin-content-header {
  padding: 20px 30px 0;
  background: var(--bg-main);
}

.admin-theme {
  --primary-color: #4338ca; /* Slightly deeper purple for admin */
}
</style>
