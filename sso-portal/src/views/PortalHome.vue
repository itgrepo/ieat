<template>
  <MainLayout>
    <div class="portal-container">
      <!-- Hero Section -->
      <PortalHero />

      <!-- Search & Filter Bar -->
      <div class="search-section">
        <div class="search-bar-wrapper">
          <SearchBar 
            v-model="searchQuery" 
            placeholder="Search for applications, services, or tools..." 
            class="portal-search"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="no-results premium-card">
        <div class="loader"></div>
        <p>Loading your applications...</p>
      </div>

      <!-- Applications Section -->
      <div class="content-section" v-else-if="filteredApps.length > 0">
        <SectionHeader title="Your Applications" />
        <div class="apps-grid">
          <ApplicationCard 
            v-for="app in filteredApps" 
            :key="app.id" 
            v-bind="app" 
          />
        </div>
      </div>

      <!-- Services Section -->
      <div class="content-section" v-if="filteredServices.length > 0">
        <SectionHeader title="System Services" />
        <div class="services-grid">
          <ServiceCard 
            v-for="service in filteredServices" 
            :key="service.id" 
            v-bind="service" 
          />
        </div>
      </div>

      <!-- No Results State -->
      <div v-if="filteredApps.length === 0 && filteredServices.length === 0" class="no-results premium-card">
        <div class="empty-icon">🔍</div>
        <h3>No matching results found</h3>
        <p>Try searching for a different keyword or app category.</p>
        <button @click="searchQuery = ''" class="btn-primary">Clear Search</button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import PortalHero from '../components/dashboard/PortalHero.vue'
import SectionHeader from '../components/dashboard/SectionHeader.vue'
import SearchBar from '../components/common/SearchBar.vue'
import ApplicationCard from '../components/dashboard/ApplicationCard.vue'
import ServiceCard from '../components/dashboard/ServiceCard.vue'
import { mockServices } from '../data/mockPortalData'

const searchQuery = ref('')
const apps = ref([])
const loading = ref(true)

const fetchApps = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/applications`)
    if (response.ok) {
      apps.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch apps:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchApps()
})

const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  return apps.value.filter(app => 
    app.name.toLowerCase().includes(query) || 
    app.description.toLowerCase().includes(query) ||
    app.category.toLowerCase().includes(query) ||
    app.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

const filteredServices = computed(() => {
  if (!searchQuery.value) return mockServices
  const query = searchQuery.value.toLowerCase()
  return mockServices.filter(service => 
    service.name.toLowerCase().includes(query) || 
    service.description.toLowerCase().includes(query)
  )
})
</script>

<style scoped>
.portal-container { max-width: 1200px; margin: 0 auto; padding-bottom: 60px; }

.search-section {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.search-bar-wrapper {
  width: 100%;
  max-width: 700px;
  background: white;
  padding: 8px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-top: -40px; /* Overlap with hero slightly */
}

.content-section { margin-bottom: 48px; }

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.no-results {
  text-align: center;
  padding: 80px 40px;
  background: white;
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-main);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-results h3 { font-size: 20px; color: var(--text-main); margin-bottom: 8px; }
.no-results p { color: var(--text-muted); margin-bottom: 24px; }

@media (max-width: 768px) {
  .apps-grid, .services-grid { grid-template-columns: 1fr; }
}
</style>
