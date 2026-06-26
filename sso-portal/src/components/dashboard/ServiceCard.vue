<template>
  <div class="service-card premium-card" :style="{ '--service-color': color }">
    <div class="service-icon">
      <component :is="iconComponent" :size="24" />
    </div>
    <div class="service-content">
      <h4 class="service-name">{{ name }}</h4>
      <p class="service-description">{{ description }}</p>
    </div>
    <div class="service-action">
      <ChevronRight :size="18" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LifeBuoy, Lock, BookOpen, BarChart3, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  name: String,
  description: String,
  icon: String,
  color: { type: String, default: 'var(--primary-color)' }
})

const iconComponent = computed(() => {
  const icons = { LifeBuoy, Lock, BookOpen, BarChart3 }
  return icons[props.icon] || LifeBuoy
})
</script>

<style scoped>
.service-card {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--service-color);
  opacity: 0.6;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: var(--service-color);
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--bg-main);
  color: var(--service-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-content { flex: 1; min-width: 0; }
.service-name { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.service-description { 
  font-size: 13px; 
  color: var(--text-muted); 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

.service-action { color: var(--text-muted); opacity: 0; transition: all 0.3s ease; }
.service-card:hover .service-action { transform: translateX(4px); opacity: 1; }
</style>
