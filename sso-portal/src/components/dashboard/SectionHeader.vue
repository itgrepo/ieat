<template>
  <div class="section-header" :class="{ 'mt-40': mt }">
    <h3>{{ title }}</h3>
    <p v-if="subtitle" class="text-muted">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  mt: Boolean
})
</script>

<style scoped>
.section-header { margin-bottom: 24px; }
.section-header h3 { font-size: 22px; font-weight: 700; color: var(--text-dark); }
.section-header p { font-size: 14px; margin-top: 4px; }
.mt-40 { margin-top: 40px; }
</style>
