<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <template #header-actions>
      <div class="log-filters">
        <select v-model="filterType" class="filter-select">
          <option value="All">All Events</option>
          <option value="Login">Login</option>
          <option value="Access">Access</option>
          <option value="Admin">Admin Activity</option>
        </select>
        <button class="btn-outline">Export CSV</button>
      </div>
    </template>

    <div class="premium-card table-wrapper">
      <DataTable :columns="columns" :data="filteredLogs">
        <template #row="{ row }">
          <td class="timestamp">{{ row.timestamp }}</td>
          <td>{{ row.user }}</td>
          <td>
            <TagBadge :label="row.event" :variant="getEventVariant(row.event)" />
          </td>
          <td>{{ row.resource }}</td>
          <td>{{ row.ip }}</td>
          <td>
            <span :class="row.status === 'Success' ? 'text-success' : 'text-error'">
              {{ row.status }}
            </span>
          </td>
        </template>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Filter, Download, Activity, AlertCircle, ShieldCheck, User } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import DataTable from '../../components/admin/DataTable.vue'
import TagBadge from '../../components/dashboard/TagBadge.vue'

const searchQuery = ref('')
const selectedType = ref('All Events')
const logs = ref([])
const loading = ref(true)

const fetchLogs = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/logs`)
    if (response.ok) {
      const data = await response.json()
      // Map backend logs to UI format if needed
      logs.value = data.map(log => ({
        id: log.id,
        timestamp: log.timestamp.replace('T', ' ').substr(0, 19),
        event: log.event,
        user: log.userId || 'System',
        details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
        ip: log.ip || '127.0.0.1',
        resource: log.resource || 'N/A', // Added resource as it's used in the template
        status: log.status || 'N/A' // Added status as it's used in the template
      }))
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User' },
  { key: 'event', label: 'Event' },
  { key: 'resource', label: 'Resource' },
  { key: 'ip', label: 'IP Address' },
  { key: 'status', label: 'Status' }
]

const filteredLogs = computed(() => {
  if (selectedType.value === 'All Events') return logs.value
  return logs.value.filter(log => log.event === selectedType.value)
})

const getEventIcon = (event) => {
  if (event.includes('FAILURE')) return AlertCircle
  if (event.includes('SUCCESS')) return ShieldCheck
  if (event.includes('APP')) return Activity
  return User
}

const getEventVariant = (event) => {
  if (event === 'Login') return 'purple'
  return 'default'
}
</script>

<style scoped>
.log-filters { display: flex; gap: 12px; }
.filter-select { padding: 8px 12px; border-radius: var(--radius-sm); border: var(--border-default); background: white; }
.btn-outline { border: var(--border-default); padding: 8px 16px; border-radius: var(--radius-sm); font-weight: 600; background: white; }
.timestamp { font-family: monospace; color: var(--text-muted); }
.text-success { color: #166534; font-weight: 600; }
.text-error { color: #991b1b; font-weight: 600; }
.table-wrapper { overflow-x: auto; }
</style>
