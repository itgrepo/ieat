<template>
  <AdminLayout adminTitle="Applications Management">
    <template #header-actions>
      <button class="btn-primary" @click="showModal = true">Register New App</button>
    </template>

    <div class="apps-list">
      <ApplicationManagerCard 
        v-for="app in apps" 
        :key="app.id"
        v-bind="app"
        :sources="sources"
        :policies="policies"
        @save="handleSave(app)"
        @stats="handleStats(app.id)"
      />
    </div>

    <!-- Modal for Registering New App -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Register New Application</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <AppForm @save="handleCreate" @cancel="showModal = false" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Filter, Shield, MoreVertical } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import ApplicationManagerCard from '../../components/admin/ApplicationManagerCard.vue'
import DataTable from '../../components/admin/DataTable.vue'
import AppForm from '../../components/admin/AppForm.vue'

const sources = ['Any Provider', 'SAML (Azure)', 'OIDC (Google)', 'LDAP Only']
const policies = ['Default Allow', 'MFA Required', 'IT Department Only', 'Admin Only']

const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const showModal = ref(false)
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

const categories = ['All Categories', 'Operations', 'Finance', 'Security', 'Human Resources']

const filteredApps = computed(() => {
  return apps.value.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All Categories' || app.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleCreate = async (formData) => {
  try {
    const newApp = {
      id: String(Date.now()),
      name: formData.name,
      description: `Access portal for ${formData.name}`,
      category: formData.category,
      url: formData.url || '#',
      accent: '#4338ca',
      tags: ['Custom']
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/applications/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newApp)
    })

    if (response.ok) {
      showModal.value = false
      await fetchApps()
    } else {
      const err = await response.json()
      alert(err.error || 'Failed to register application')
    }
  } catch (error) {
    console.error('Failed to create application:', error)
    alert('Network error registering application')
  }
}

const handleSave = (app) => { console.log('Saving app:', app) }
const handleStats = (id) => { console.log('Viewing stats for:', id) }
</script>

<style scoped>
.apps-list { display: flex; flex-direction: column; gap: 16px; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #1e293b;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
