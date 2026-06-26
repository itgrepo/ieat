<template>
  <MainLayout title="Digital Smart Port">
    <div class="dashboard-container">
      <div class="portal-header premium-card">
        <div class="header-content">
          <h1>Smart Port Portal (SSO)</h1>
          <p>Single Sign-On Access Point</p>
          <div class="tag-container">
            <TagBadge label="ภาคผนวก ก 1.1 (SSO)" variant="purple" />
            <TagBadge label="ภาคผนวก ก 6 (UX/UI MTPP Portal)" variant="purple" />
          </div>
        </div>
      </div>

      <SectionHeader title="Application Dashboard" />

      <div class="app-grid">
        <ApplicationCard 
          v-for="app in applications" 
          :key="app.id" 
          v-bind="app"
          :disabled="isAppDisabled(app)"
          @enter="handleEnter(app)"
        />
      </div>

      <SectionHeader title="Service" mt />

      <div class="app-grid">
        <ApplicationCard 
          v-for="service in services" 
          :key="service.id" 
          v-bind="service"
          accentColor="#8b5cf6"
          :disabled="isAppDisabled(service)"
          @enter="handleEnter(service)"
        />
      </div>

      <InformationSection />


    </div>
  </MainLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import InformationSection from '../components/dashboard/InformationSection.vue'
import SectionHeader from '../components/dashboard/SectionHeader.vue'
import ApplicationCard from '../components/dashboard/ApplicationCard.vue'
import TagBadge from '../components/dashboard/TagBadge.vue'

const applications = ref([])

const fetchApps = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/applications`)
    if (response.ok) {
      const data = await response.json()
      
      const defaults = {
        'MTP Port Net': { description: 'ระบบบริหารจัดการท่าเรือ', tag: 'ภาคผนวก ก 1.1.1', accentColor: '#3b82f6' },
        'PMIS': { description: 'ระบบจัดเก็บรายได้', tag: 'ภาคผนวก ก 1.1.2', accentColor: '#ec4899' },
        'VTMS': { description: 'จราจรทางน้ำ', tag: 'ภาคผนวก ก 1.1.3', accentColor: '#10b981' },
        'e-PP / Drone': { description: 'ระบบอนุญาต', tag: 'ข้อ 4.4', accentColor: '#8b5cf6' },
        'ID Providers': { description: 'ระบบจัดการผู้ให้บริการยืนยันตัวตน', tag: 'SSO Settings', accentColor: '#4f46e5' }
      };

      applications.value = data.map(app => {
        const def = defaults[app.name];
        return {
          id: app.id,
          name: app.name,
          description: def ? def.description : (app.description || ''),
          tag: def ? def.tag : (app.tags && app.tags.length > 0 ? app.tags.join(', ') : 'Custom'),
          accentColor: def ? def.accentColor : (app.accent || '#4f46e5'),
          url: app.url || '#'
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch applications:', error)
  }
}

onMounted(() => {
  fetchApps()
})

const services = ref([
  { id: 5, name: 'PMIS & e-Signature', description: 'ระบบลงนามอิเล็กทรอนิกส์' },
  { id: 6, name: 'Drone & VTMS', description: 'ระบบควบคุมโดรนและจราจร' }
])

const isAppDisabled = (app) => {
  const activeUserStr = localStorage.getItem('sso_user') || localStorage.getItem('user');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;
  
  if (!activeUser) return true;

  const isAdmin = activeUser.role === 'Admin' || activeUser.department === 'Administrator';
  const dept = (activeUser.department || '').toLowerCase();
  const source = (activeUser.auth_source || '').toUpperCase();
  const fullName = (activeUser.fullName || '').toLowerCase();

  if (app.name === 'MTP Port Net') {
    return !activeUser.mtpKey;
  }
  
  if (app.name === 'PMIS') {
    return !(isAdmin || source === 'PMIS' || dept.includes('pmis') || fullName.includes('pmis'));
  }
  
  if (app.name === 'VTMS') {
    return !(isAdmin || source === 'VTMS' || dept.includes('vtms') || fullName.includes('vtms'));
  }

  if (app.name === 'e-Surveillance') {
    return false;
  }
  
  return true;
}

import { useRouter } from 'vue-router'
const router = useRouter()

const handleEnter = (app) => {
  if (app.name === 'PMIS') {
    executeStandardSSO()
  } else if (app.name === 'VTMS') {
    executeVtmsSSO()
  } else if (app.name === 'MTP Port Net') {
    executeMtpSSO()
  } else if (app.name === 'ID Providers') {
    router.push('/admin/idp')
  } else if (app.url && app.url !== '#') {
    let url = app.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  } else {
    console.log(`Entering application ${app.name}`)
  }
}

// VTMS SSO FLOW
const executeVtmsSSO = async () => {
  const activeUserStr = localStorage.getItem('sso_user') || localStorage.getItem('user')
  if (!activeUserStr) {
    alert('No active SSO session. Please log in first.')
    return
  }

  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/v1/auth/sso/vtms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: btoa(unescape(encodeURIComponent(activeUserStr))) })
    })

    const data = await response.json()
    if (data.status === 'success' && data.redirectUrl) {
      window.open(data.redirectUrl, '_blank')
    } else {
      alert('Failed to generate VTMS SSO token: ' + data.message)
    }
  } catch (error) {
    alert('Connection failure generating VTMS token.')
  }
}

// MTP-PORT-NET SSO FLOW
const executeMtpSSO = async () => {
  const activeUserStr = localStorage.getItem('sso_user') || localStorage.getItem('user')
  if (!activeUserStr) {
    alert('No active SSO session. Please log in first.')
    return
  }

  const activeUser = JSON.parse(activeUserStr)
  if (!activeUser.mtpKey) {
    alert('ไม่พบข้อมูลการเข้าสู่ระบบ MTP-PORT-NET ของคุณ (กรุณาล็อกอินด้วยรหัสผ่านของ MTP-PORT-NET ตั้งแต่แรกเพื่อใช้งานฟีเจอร์นี้)')
    return
  }

  // Type 1 = Operator (ผปก.), Type 2 = Staff (เจ้าหน้าที่)
  let url = '';
  if (activeUser.mtpType === 1) {
    url = `https://uat-mtpportnet-ent.nidpro.tech/mtpport_ent/sso/sso_mtp/${activeUser.mtpKey}`;
  } else {
    url = `https://uat-mtpportnet-staff.nidpro.tech/mtpport_ieat/sso/sso_mtp/${activeUser.mtpKey}`;
  }

  window.open(url, '_blank');
}

// 1. STANDARD SSO FLOW
const executeStandardSSO = async () => {
  const activeUserStr = localStorage.getItem('sso_user')
  if (!activeUserStr) {
    alert('No active SSO session. Please log in first.')
    return
  }

  const activeUser = JSON.parse(activeUserStr)
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: activeUser.id, applicationId: 'PMIS' })
    })

    const data = await response.json()
    if (data.success) {
      window.location.href = data.redirectUrl
    } else {
      alert('Failed to generate SSO token: ' + data.error)
    }
  } catch (error) {
    alert('Connection failure generating token.')
  }
}
</script>

<style scoped>
.dashboard-container { max-width: 1200px; margin: 0 auto; }
.portal-header { padding: 40px; margin-bottom: 40px; border-left: 8px solid var(--primary-color); }
.header-content h1 { font-size: 28px; margin-bottom: 8px; }
.header-content p { color: var(--text-muted); margin-bottom: 20px; }
.tag-container { display: flex; gap: 12px; }

/* SSO Simulator Card */
.sso-simulator-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 40px;
  text-align: left;
}

.simulator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 12px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 10px #3b82f6;
  animation: simPulse 1.5s infinite;
}

@keyframes simPulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}

.simulator-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.sim-badge {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.sim-desc {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.5;
}

.simulator-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.btn-simulate-launch {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: all 0.2s;
}

.btn-simulate-launch:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
}

.or-separator {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.btn-secondary-sim {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-sim:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sim-tip {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.sim-tip code {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* Auth Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-modal {
  width: 100%;
  max-width: 520px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-align: left;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  color: white;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  color: #cbd5e1;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.option-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.option-card.Highlighted {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.25);
}

.option-card.Highlighted:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
}

.opt-icon {
  font-size: 24px;
  margin-right: 16px;
}

.opt-text {
  flex: 1;
}

.opt-text h6 {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.opt-text p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.arrow {
  color: #64748b;
  font-size: 18px;
  transition: transform 0.2s;
}

.option-card:hover .arrow {
  color: white;
  transform: translateX(4px);
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1024px) {
  .app-grid { grid-template-columns: 1fr; }
}
</style>
