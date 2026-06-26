<script setup>
import { ref, onMounted } from 'vue';
import AppSidebar from '../components/AppSidebar.vue';
import apiClient from '../utils/api';

const favoriteDatasets = ref([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const selectedDataset = ref(null);

const closeDashboardModal = () => {
  isModalOpen.value = false;
  selectedDataset.value = null;
};

const loadFavorites = async () => {
  isLoading.value = true;
  const localFavorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
  
  try {
    const response = await apiClient.post('/getService');
    if (response.data && response.data.status === 'success') {
      const latestDatasets = response.data.data;
      favoriteDatasets.value = localFavorites.map(fav => {
        const matched = latestDatasets.find(d => d.service_id === fav.id || d.id === fav.id);
        if (matched) {
          return {
            ...fav,
            ...matched,
            id: fav.id // preserve the local ID key
          };
        }
        return fav;
      });
      localStorage.setItem('user_favorites', JSON.stringify(favoriteDatasets.value));
    } else {
      favoriteDatasets.value = localFavorites;
    }
  } catch (error) {
    console.error('Error syncing favorites with server:', error);
    favoriteDatasets.value = localFavorites;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadFavorites();
});

const removeFavorite = (id) => {
    favoriteDatasets.value = favoriteDatasets.value.filter(f => f.id !== id);
    localStorage.setItem('user_favorites', JSON.stringify(favoriteDatasets.value));
};

const openDashboardDirectly = (ds) => {
  if (ds.external_dashboard_url) {
      selectedDataset.value = ds;
      isModalOpen.value = true;
  } else {
      window.location.href = '/dataset/' + (ds.dataset_id || ds.id) + '?tab=visual';
  }
};
</script>

<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <header class="page-header">
        <div class="header-left">
          <h1>รายการโปรด (Favorites)</h1>
          <p class="subtitle">ชุดข้อมูลที่คุณบันทึกไว้เพื่อการเข้าถึงอย่างรวดเร็ว</p>
        </div>
      </header>

      <div v-if="favoriteDatasets.length === 0" class="card shadow-premium empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-1.103 1.821-1.891 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.788.703-2.191-.197-1.891-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h2>ยังไม่มีรายการโปรด</h2>
        <p>คุณสามารถเพิ่มชุดข้อมูลเข้าสู่รายการโปรดได้จากการคลิกไอคอนดาวในหน้าแคตตาล็อก</p>
        <router-link to="/" class="btn-primary mt-6">ไปที่ค้นหาชุดข้อมูล (Data Catalog)</router-link>
      </div>

      <div v-else class="datasets-list-vertical">
        <router-link v-for="ds in favoriteDatasets" :key="ds.id" :to="'/dataset/' + ds.id" class="ds-horizontal-card">
          <div class="ds-main-content">
            <div class="ds-header" style="align-items: flex-start; justify-content: space-between;">
              <h4 class="ds-title" style="flex: 1; margin-right: 16px;">{{ ds.title || ds.name || 'ชุดข้อมูลทั่วไป' }}</h4>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; max-width: 50%;">
                <span class="badge access-open">{{ ds.accessibility || 'Open Data' }}</span>
                <span v-if="ds.api_enabled" :class="['badge', ds.api_type === 'private' ? 'format-api-private' : (ds.api_type === 'scope' ? 'format-api-scope' : 'format-api-public')]">
                  API: {{ ds.api_type === 'private' ? 'Private' : (ds.api_type === 'scope' ? 'Scope' : 'Public') }}
                </span>
                <template v-for="f in (ds.formats ? ds.formats.filter(f => f.toUpperCase() !== 'API') : [])" :key="f">
                  <span class="badge format">{{ f }}</span>
                </template>
                <button class="btn-favorite is-active" @click.stop.prevent="removeFavorite(ds.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-1.103 1.821-1.891 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.788.703-2.191-.197-1.891-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="ds-description">{{ ds.description || 'รวบรวมข้อมูลเพื่อการวิเคราะห์และนำไปใช้ประโยชน์ในระดับหน่วยงาน' }}</p>
            <div class="ds-footer">
              <div class="ds-left-actions">
                <button v-if="(ds.formats && ds.formats.some(f => f.toUpperCase() === 'DASHBOARD' || f === 'แดชบอร์ด')) || ds.external_dashboard_url" class="badge format dashboard-btn hover:opacity-80 transition-opacity" @click.stop.prevent="openDashboardDirectly(ds)" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; padding: 0; background-color: #393391; color: #ffffff; border-radius: 6px; box-shadow: 0 2px 4px rgba(57,51,145,0.3);" title="เปิด Dashboard">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </button>
              </div>
              <div class="ds-meta">
                <span class="agency">{{ ds.agency || 'ไม่ระบุหน่วยงาน' }}</span>
                <span class="separator" v-if="ds.views">•</span>
                <span class="views" v-if="ds.views">{{ ds.views }}</span>
                <span class="separator" v-if="ds.updated">•</span>
                <span class="updated" v-if="ds.updated">{{ ds.updated }}</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </main>

    <!-- Dashboard Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeDashboardModal">
        <div class="modal-container fullscreen-modal">
          <header class="modal-header">
            <div class="title-with-badge">
              <h2>{{ selectedDataset?.title || selectedDataset?.name || 'แดชบอร์ด' }}</h2>
              <span class="id-badge" v-if="selectedDataset?.dataset_id">{{ selectedDataset?.dataset_id }}</span>
            </div>
            <button class="btn-close" @click="closeDashboardModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="modal-body scrollbar-custom" style="padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
            <div class="dashboard-container" style="display: flex; flex-direction: column; flex: 1; height: 100%;">
              <div class="dashboard-actions" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 8px; color: #475569; font-weight: 500;">
                  <span>External Dashboard</span>
                </div>
                <a :href="selectedDataset?.external_dashboard_url" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background-color: #393391; color: white; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  เปิดในหน้าต่างใหม่
                </a>
              </div>
              <div class="iframe-wrapper" style="flex: 1; position: relative; background: #f8fafc; min-height: 60vh;">
                <iframe 
                  v-if="selectedDataset?.external_dashboard_url"
                  :src="selectedDataset.external_dashboard_url" 
                  width="100%" 
                  height="100%" 
                  frameborder="0" 
                  allowfullscreen
                  style="border: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                ></iframe>
                <div v-else style="padding: 40px; text-align: center; color: #64748b;">
                  ไม่พบ URL แดชบอร์ดสำหรับชุดข้อมูลนี้
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f1f5f9;
}

.content {
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin-bottom: 4px;
}

.subtitle {
  color: #64748b;
  font-size: 0.9375rem;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
}

.shadow-premium {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

p {
  color: #64748b;
  max-width: 400px;
  margin: 0 auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background-color: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 24px;
}

.btn-primary:hover {
  background-color: #1e293b;
  transform: translateY(-1px);
}

.datasets-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.ds-horizontal-card {
  display: block;
  text-decoration: none;
  background-color: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
  cursor: pointer;
}

.ds-horizontal-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
}

.ds-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.ds-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.btn-favorite {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.btn-favorite:hover {
  transform: scale(1.1);
  color: #eab308;
}

.btn-favorite.is-active {
  color: #eab308;
}

.ds-description {
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 800px;
}

.ds-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ds-badges {
  display: flex;
  gap: 12px;
}

.badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.access-open {
  background-color: #fdf2f8;
  color: var(--mso-accent);
}

.format {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.format-api-public { background-color: #e0e7ff; color: #4338ca; }
.format-api-private { background-color: #fce7f3; color: #be185d; }
.format-api-scope { background-color: #ffedd5; color: #c2410c; }

.ds-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.separator {
  opacity: 0.5;
}

.mt-6 {
  margin-top: 1.5rem;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px;
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.3s ease;
}

.fullscreen-modal {
  max-width: 95vw !important;
  height: 95vh !important;
  max-height: 95vh !important;
}

@keyframes modalScaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.id-badge {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* Scrollbar Styling */
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
