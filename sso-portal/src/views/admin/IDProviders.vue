<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <template #header-actions>
      <button class="btn-primary pro-btn" @click="openWizard()">
        <Plus :size="18" />
        <span>Add Identity Source</span>
      </button>
    </template>

    <div class="idp-container">
      <!-- Info Header -->
      <div class="page-intro">
        <p>Configure and manage external identity providers for your SSO portal. Supports SAML 2.0, OIDC, and AD/LDAP protocols.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-shimmer-grid">
        <div v-for="i in 3" :key="i" class="shimmer-card"></div>
      </div>

      <!-- Grid of IDPs -->
      <div v-else-if="providers.length > 0" class="idp-grid">
        <div v-for="source in providers" :key="source.id" class="idp-glass-card">
          <div class="card-header">
            <div :class="['protocol-pill', source.protocolType]">
              {{ source.protocolType.toUpperCase() }}
            </div>
            <div class="header-right">
              <div class="readiness-indicator" :class="source.readinessStatus || 'draft'">
                <ShieldCheck v-if="source.readinessStatus === 'ready'" :size="14" />
                <AlertCircle v-else :size="14" />
                <span>{{ (source.readinessStatus || 'draft').toUpperCase() }}</span>
              </div>
              <div class="status-indicator" :class="source.status || 'active'">
                <span class="dot"></span>
                {{ source.status || 'Active' }}
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <div class="source-main-info">
              <h3 class="source-title">{{ source.sourceName }}</h3>
              <p class="source-key">{{ source.displayName || source.sourceName }} <code>({{ source.sourceKey }})</code></p>
            </div>
            
            <div v-if="source.lastTestResult" class="test-summary-mini animate-fade-in">
              <div class="test-meta">
                <span :class="['test-dot', { success: source.lastTestResult.success, error: !source.lastTestResult.success }]"></span>
                <strong>Last Test: {{ source.lastTestResult.success ? 'Passed' : 'Failed' }}</strong>
                <span class="test-ts">{{ formatDate(source.lastTestResult.timestamp) }}</span>
              </div>
              <p class="test-msg">{{ source.lastTestResult.message }}</p>
            </div>
            <p v-else class="source-description">{{ source.description || 'No description provided for this identity source.' }}</p>
          </div>

          <div class="card-footer">
            <div class="timestamp">
              <Activity :size="14" />
              {{ source.lastTestedAt ? `Tested: ${formatDate(source.lastTestedAt)}` : `Created: ${formatDate(source.createdAt)}` }}
            </div>
            <div class="card-actions">
              <button class="icon-btn" @click="editSource(source)" title="Configure">
                <Settings :size="18" />
              </button>
              <button class="icon-btn delete" @click="confirmDelete(source)" title="Delete">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="pro-empty-state">
        <div class="empty-illustration">
          <Shield :size="64" class="shield-pulse" />
        </div>
        <h3>No Identity Sources Configured</h3>
        <p>Your portal is currently using local authentication only. Add an external identity source to enable SSO for your users.</p>
        <button class="btn-primary" @click="openWizard()">
          <Plus :size="18" /> Create Your First Source
        </button>
      </div>
    </div>

    <!-- Wizard Modal -->
    <transition name="modal-fade">
      <div v-if="showWizard" class="pro-modal-overlay" @click.self="showWizard = false">
        <div class="pro-modal-content">
          <div class="modal-header">
            <h2>{{ editingSource ? 'Edit Identity Source' : 'New Identity Source' }}</h2>
            <button class="close-btn" @click="showWizard = false">✕</button>
          </div>
          <IdentitySourceWizard 
            :initialData="editingSource" 
            @save="handleSave" 
            @cancel="showWizard = false" 
          />
        </div>
      </div>
    </transition>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Settings, Shield, Activity, Trash2, AlertCircle, ShieldCheck, Database } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import IdentitySourceWizard from '../../components/admin/IdentitySourceWizard.vue'

const providers = ref([])
const loading = ref(true)
const showWizard = ref(false)
const editingSource = ref(null)

const fetchProviders = async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/identity-sources`)
    if (response.ok) {
      providers.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch providers:', error)
  } finally {
    loading.value = false
  }
}

const openWizard = () => {
  editingSource.value = null
  showWizard.value = true
}

const editSource = (source) => {
  editingSource.value = source
  showWizard.value = true
}

const saving = ref(false)
const handleSave = async (formData) => {
  saving.value = true
  const isEdit = !!editingSource.value
  const url = isEdit 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/identity-sources/${editingSource.value.id}`
    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/identity-sources`
  
  try {
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      showWizard.value = false
      fetchProviders()
    } else {
      const result = await response.json()
      alert(`Save failed: ${result.error || result.details || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Save failed:', error)
    alert(`Communication error: ${error.message}`)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (source) => {
  if (confirm(`Are you sure you want to delete ${source.sourceName}?`)) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/identity-sources/${source.id}`, { method: 'DELETE' })
      fetchProviders()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB')
}

onMounted(fetchProviders)
</script>

<style scoped>
.idp-container { max-width: 1200px; margin: 0 auto; }
.page-intro { margin-bottom: 32px; color: #64748b; font-size: 15px; }

.idp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* Premium Glass Card */
.idp-glass-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.idp-glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.protocol-pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.protocol-pill.saml { background: #e0e7ff; color: #4338ca; }
.protocol-pill.oidc { background: #dcfce7; color: #15803d; }
.protocol-pill.adldap { background: #fef9c3; color: #854d0e; }

.status-indicator { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.status-indicator.active { color: #16a34a; }
.status-indicator .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

.source-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.source-key { font-size: 13px; color: #64748b; margin-bottom: 12px; }
.source-key code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500; }

.header-right { display: flex; align-items: center; gap: 12px; }

.readiness-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
}

.readiness-indicator.ready { background: #f0fdf4; color: #16a34a; }
.readiness-indicator.error { background: #fef2f2; color: #ef4444; }
.readiness-indicator.configured { background: #eff6ff; color: #3b82f6; }

.test-summary-mini {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  margin-top: 4px;
}

.test-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #1e293b; margin-bottom: 4px; }
.test-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.test-dot.success { background: #16a34a; box-shadow: 0 0 8px rgba(22, 163, 74, 0.4); }
.test-dot.error { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
.test-ts { margin-left: auto; color: #94a3b8; font-size: 10px; font-weight: 700; }
.test-msg { font-size: 12px; color: #64748b; line-height: 1.4; margin: 0; }

.source-description { font-size: 14px; color: #475569; line-height: 1.6; min-height: 44px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; }

.card-actions { display: flex; gap: 8px; }
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { background: #fff; color: var(--primary-color); border-color: var(--primary-color); }
.icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; }

/* Modal Overlay */
.pro-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px;
}

.pro-modal-content {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 40px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }

/* Empty State */
.pro-empty-state {
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 32px;
  border: 2px dashed #e2e8f0;
}
.empty-illustration { margin-bottom: 24px; color: #e2e8f0; }
.shield-pulse { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
}
.pro-empty-state h3 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
.pro-empty-state p { color: #64748b; margin-bottom: 32px; max-width: 500px; margin-inline: auto; font-size: 16px; }

/* Loading State */
.loading-shimmer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}
.shimmer-card {
  height: 250px;
  background: #f1f5f9;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}
.shimmer-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
