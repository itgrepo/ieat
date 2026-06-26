<template>
  <div class="layout-wrapper">
    <Sidebar />
    <div class="main-container">
      <Header :title="title" />
      <main class="content">
        <slot></slot>
      </main>
      <Footer v-if="showFooter" />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/common/Sidebar.vue'
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'

defineProps({
  title: String,
  showFooter: {
    type: Boolean,
    default: true
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
</style>
